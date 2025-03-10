/* eslint-disable @typescript-eslint/no-explicit-any */

class DocumentPager {
  contentMaxWidth: number = 570;
  contentMaxHeight: number = 884;
  nodeMeta: Record<string, any> = {};
  forceNewPageForH1: boolean = false;
  firstLineIndentEm: number = 2;
  pages: any[] = [];
  nodesIndex: number = 0;
  nodeList: any[] = [];
  textIndex: number = 0;
  pageIndex: number = 0;
  tempBound: {
    width: number;
    height: number;
  } = {
    width: 0,
    height: 0,
  };
  prevMarginBottom: number = 0;

  constructor(options: {
    contentMaxWidth?: number;
    contentMaxHeight?: number;
    nodeMeta?: Record<string, any>;
    forceNewPageForH1?: boolean;
    firstLineIndentEm?: number;
  }) {
    const { contentMaxWidth, contentMaxHeight, nodeMeta, forceNewPageForH1, firstLineIndentEm } = options || {};
    if (typeof contentMaxWidth !== "number" || contentMaxWidth <= 0) {
      throw new Error("contentMaxWidth is required");
    }
    if (typeof contentMaxHeight !== "number" || contentMaxHeight <= 0) {
      throw new Error("contentMaxHeight is required");
    }
    if (!nodeMeta) {
      throw new Error("nodeMeta is required");
    }
    this.contentMaxWidth = contentMaxWidth;
    this.contentMaxHeight = contentMaxHeight;
    this.nodeMeta = nodeMeta;
    this.forceNewPageForH1 = !!forceNewPageForH1;
    this.firstLineIndentEm = typeof firstLineIndentEm === "number" ? firstLineIndentEm : 2;
  }

  getItemNumericStyle(item: any) {
    return {
      ...((this.nodeMeta[item.type] && this.nodeMeta[item.type].numericStyle) || {}),
      ...(item.customNumericStyle || {}),
    };
  }

  getItemStyle(item: any) {
    if (item.type === "image" || item.type === "custom") {
      return item.style;
    }
    const style = {
      ...((this.nodeMeta[item.type] && this.nodeMeta[item.type].style) || {}),
    };
    const numericStyle = this.getItemNumericStyle(item);
    Object.keys(numericStyle).forEach((key) => {
      style[key] = `${numericStyle[key]}px`;
    });
    if (item.type === "p" && item.indent !== false && item.firstLine) {
      style["text-indent"] = `${this.firstLineIndentEm}em`;
    }
    return {
      fontFamily: "Arial",
      ...style,
      ...(item.customStyle || {}),
    };
  }

  insertNewPage() {
    this.pages.push({
      items: [],
    });
    this.pageIndex++;
    this.tempBound = {
      width: 0,
      height: 0,
    };
    this.prevMarginBottom = 0;
  }

  checkIfNeedNewPage(options: { nextLineHeight: number }) {
    const { nextLineHeight } = options;
    if (this.tempBound.height + nextLineHeight >= this.contentMaxHeight) {
      this.insertNewPage();
    }
  }

  expandCheck(options: any = {}): any {
    const { ctx, inline, item, checkLen, nextLineHeight, marginBottom = 0, fontSize } = options;
    const checkContent = item.content.slice(this.textIndex, this.textIndex + checkLen);
    const textMetrics = ctx.measureText(checkContent);
    const firstLine = item.type === "p" && this.textIndex === 0;
    const lineMaxWidth =
      firstLine && item.indent !== false && this.firstLineIndentEm > 0
        ? this.contentMaxWidth - this.firstLineIndentEm * fontSize
        : this.contentMaxWidth;
    if (textMetrics.width + this.tempBound.width <= lineMaxWidth) {
      // 能装下
      if (this.textIndex < item.content.length - 1 && this.textIndex + checkContent.length < item.content.length) {
        // 还有剩余长度，继续扩张检测
        return this.expandCheck({
          ctx,
          inline,
          item,
          checkLen: checkLen + 1,
          nextLineHeight,
          marginBottom,
          fontSize,
        });
      } else {
        // 没有了，直接装下
        this.pages[this.pageIndex].items.push({
          ...item,
          content: checkContent,
          firstLine,
          inline,
          inlineStart: inline && this.tempBound.width === 0,
          parentNode: this.nodeList[this.nodesIndex],
        });
        const inlineFull = inline && textMetrics.width + this.tempBound.width >= lineMaxWidth;
        if ((inline && inlineFull) || !inline) {
          // TODO: inline 场景，prevMarginBottom 需要以同一行中最大的为准
          this.prevMarginBottom = marginBottom;
        }
        Object.assign(this.tempBound, {
          width: inline ? (inlineFull ? 0 : textMetrics.width + this.tempBound.width) : 0,
          height: inline
            ? inlineFull
              ? this.tempBound.height + nextLineHeight
              : this.tempBound.height
            : this.tempBound.height + nextLineHeight,
        });
        this.textIndex = 0;
        return {
          end: true,
        };
      }
    } else {
      // 不能，说明最多能装 checkLen - 1
      this.pages[this.pageIndex].items.push({
        ...item,
        content: item.content.slice(this.textIndex, this.textIndex + checkLen - 1),
        firstLine,
        inline,
        inlineStart: inline && this.tempBound.width === 0,
        parentNode: this.nodeList[this.nodesIndex],
      });
      this.prevMarginBottom = marginBottom;
      Object.assign(this.tempBound, {
        width: 0,
        height: this.tempBound.height + nextLineHeight,
      });
      // 更新 textIndex
      this.textIndex += checkLen - 1;
      return {
        end: false,
        newOneLineWords: checkLen - 1,
      };
    }
  }

  narrowCheck(options: any = {}): any {
    const { ctx, inline, item, checkLen, nextLineHeight, marginBottom = 0, fontSize } = options;
    const checkContent = item.content.slice(this.textIndex, this.textIndex + checkLen);

    console.log("checkContent", checkContent);

    const textMetrics = ctx.measureText(checkContent);
    const firstLine = item.type === "p" && this.textIndex === 0;
    const lineMaxWidth =
      firstLine && item.indent !== false && this.firstLineIndentEm > 0
        ? this.contentMaxWidth - this.firstLineIndentEm * fontSize
        : this.contentMaxWidth;
    if (textMetrics.width + this.tempBound.width <= lineMaxWidth) {
      // 收缩检测过程中，检测到当前文本宽度加上之前内容（也可能没有之前内容）的宽度小于等于一行总宽度，说明能够装下
      this.pages[this.pageIndex].items.push({
        ...item,
        content: checkContent,
        firstLine,
        inline,
        inlineStart: inline && this.tempBound.width === 0,
        parentNode: this.nodeList[this.nodesIndex],
      });
      this.prevMarginBottom = marginBottom;
      Object.assign(this.tempBound, {
        width: 0,
        height: this.tempBound.height + nextLineHeight,
      });
      // 更新 textIndex
      this.textIndex += checkLen;
      // 判断还有没有内容
      if (this.textIndex < item.content.length - 1) {
        return {
          end: false,
          newOneLineWords: checkLen,
        };
      } else {
        // 没有更多了
        this.textIndex = 0;
        return {
          end: true,
        };
      }
    } else {
      // 依然装不下，继续收缩
      return this.narrowCheck({
        ctx,
        inline,
        item,
        checkLen: checkLen - 1,
        nextLineHeight,
        marginBottom,
        fontSize,
      });
    }
  }

  checkItem(options: any = {}) {
    const { ctx, inline, item, estimateOneLineWords, nextLineHeight, marginBottom = 0, fontSize } = options;
    // 按照预估的一行文字数量，测量文本宽度
    const checkContent = item.content.slice(this.textIndex, this.textIndex + estimateOneLineWords);
    const textMetrics = ctx.measureText(checkContent);

    const firstLine = item.type === "p" && this.textIndex === 0;

    const lineMaxWidth =
      firstLine && item.indent !== false && this.firstLineIndentEm > 0
        ? this.contentMaxWidth - this.firstLineIndentEm * fontSize
        : this.contentMaxWidth;

    if (textMetrics.width + this.tempBound.width <= lineMaxWidth) {
      // 还有剩余空间
      if (this.textIndex < item.content.length - 1 && this.textIndex + checkContent.length < item.content.length) {
        // 并且没有到最后的字符串，才可以扩张检测
        const { end, newOneLineWords } = this.expandCheck({
          ctx,
          inline,
          item,
          checkLen: estimateOneLineWords + 1,
          nextLineHeight,
          marginBottom,
          fontSize,
        });
        if (!end) {
          // 先判断高度是否够，要不要开新的页
          this.checkIfNeedNewPage({
            nextLineHeight,
          });
          // 检测余下的
          this.checkItem({
            ctx,
            inline,
            item,
            // 矫正 estimateOneLineWords
            estimateOneLineWords: newOneLineWords,
            nextLineHeight,
            fontSize,
          });
        }
      } else {
        // 到最后的字符串了，说明结束了，不需要扩张
        this.pages[this.pageIndex].items.push({
          ...item,
          content: checkContent,
          firstLine,
          inline,
          inlineStart: inline && this.tempBound.width === 0,
          parentNode: this.nodeList[this.nodesIndex],
        });
        const inlineFull = inline && textMetrics.width + this.tempBound.width >= lineMaxWidth;
        if ((inline && inlineFull) || !inline) {
          // TODO: inline 场景，prevMarginBottom 需要以同一行中最大的为准
          this.prevMarginBottom = marginBottom;
        }
        Object.assign(this.tempBound, {
          width: inline ? (inlineFull ? 0 : textMetrics.width + this.tempBound.width) : 0,
          height: inline
            ? inlineFull
              ? this.tempBound.height + nextLineHeight
              : this.tempBound.height
            : this.tempBound.height + nextLineHeight,
        });
        this.textIndex = 0;
      }
    } else {
      // 没有剩余空间，收缩检测
      const { end, newOneLineWords } = this.narrowCheck({
        ctx,
        inline,
        item,
        checkLen: estimateOneLineWords - 1,
        nextLineHeight,
        marginBottom,
        fontSize,
      });

      if (!end) {
        // 先判断高度是否够，要不要开新的页
        this.checkIfNeedNewPage({
          nextLineHeight,
        });
        // 检测余下的
        this.checkItem({
          ctx,
          inline,
          item,
          // 矫正 estimateOneLineWords
          estimateOneLineWords: newOneLineWords,
          nextLineHeight,
          fontSize,
        });
      }
    }
  }

  measureTexts(ctx: CanvasRenderingContext2D, inline?: boolean, child?: any) {
    const item = inline ? child : this.nodeList[this.nodesIndex];
    const numericStyle = this.getItemNumericStyle(item);
    const { fontSize = 14, marginTop = 0, marginBottom = 0 } = numericStyle;
    const { lineHeight = 1 } = this.getItemStyle(item);

    let nextLineHeight = fontSize * lineHeight + (marginTop > this.prevMarginBottom ? marginTop - this.prevMarginBottom : 0) + marginBottom;

    const estimateOneLineWords = Math.floor(this.contentMaxWidth / fontSize);

    if (this.forceNewPageForH1 && item.type === "h1" && !item.compact) {
      if (this.tempBound.height !== 0) {
        // 一级标题直接开新页
        this.insertNewPage();
      }
    } else {
      // 判断高度是否够，要不要开新的页
      this.checkIfNeedNewPage({
        nextLineHeight,
      });
    }

    if (this.pageIndex >= 1 && this.pages[this.pageIndex].items.length === 0) {
      // 说明是新页的第一行，应该使第一行的 marginTop 失效，否则会空出很多
      if (!item.customNumericStyle) {
        item.customNumericStyle = {};
      }
      item.customNumericStyle.marginTop = 0;
      this.prevMarginBottom = 0;
      nextLineHeight = fontSize * lineHeight + marginBottom;
    }

    const { style } = this.nodeMeta[item.type];

    // 设置样式
    ctx.font = `${fontSize}px ${style.fontFamily || "Arial"}`;

    this.checkItem({
      ctx,
      inline,
      item,
      estimateOneLineWords,
      nextLineHeight,
      marginBottom,
      fontSize,
    });
  }

  getImageRawSize(src: string): Promise<{ rawWidth: number; rawHeight: number; scale: number }> {
    const image = new Image();
    image.src = src;
    return new Promise((resolve) => {
      image.onload = () =>
        resolve({
          rawWidth: image.width,
          rawHeight: image.height,
          scale: image.width / image.height,
        });
    });
  }

  async measureImage() {
    const item = this.nodeList[this.nodesIndex];
    const numericStyle = this.getItemNumericStyle(item);
    const { marginTop = 0, marginBottom = 0 } = numericStyle;
    const renderMarginTop = marginTop > this.prevMarginBottom ? marginTop - this.prevMarginBottom : 0;
    const { rawWidth, rawHeight, scale } = await this.getImageRawSize(item.src);
    const { width, height } = item;
    const resolvedWidth = width ? width : rawWidth;
    const resolvedHeight = height ? height : width ? width * scale : rawHeight;
    const renderWidth = resolvedWidth > this.contentMaxWidth ? this.contentMaxWidth : resolvedWidth;
    const renderHeight = resolvedHeight > this.contentMaxHeight ? this.contentMaxHeight : resolvedHeight;
    const imageBlockHeight = renderHeight + renderMarginTop + marginBottom;
    if (this.tempBound.height + imageBlockHeight >= this.contentMaxHeight) {
      this.insertNewPage();
    }
    this.tempBound.height += imageBlockHeight;
    this.pages[this.pageIndex].items.push({
      ...item,
      style: {
        width: `${renderWidth}px`,
        height: `${renderHeight}px`,
        marginTop: `${renderMarginTop}px`,
        marginBottom: `${marginBottom}px`,
      },
    });
    this.prevMarginBottom = marginBottom;
  }

  measureCustom() {
    const item = this.nodeList[this.nodesIndex];
    const { width, height } = item.nodeRect;
    if (this.tempBound.height + height >= this.contentMaxHeight) {
      this.insertNewPage();
    }
    this.tempBound.height += height;
    this.pages[this.pageIndex].items.push({
      ...item,
      style: {
        width: `${width}px`,
        height: `${height}px`,
      },
    });
    this.prevMarginBottom = 0;
  }

  async calc(nodeList: any[]) {
    this.nodeList = nodeList;
    // 创建一个离屏 canvas
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    this.pages = [
      {
        items: [],
      },
    ];
    for (let i = 0; i < this.nodeList.length; i++) {
      if (this.nodeList[this.nodesIndex].type === "view") {
        // 是一个容器
        // 1. 先处理容器的 marginTop
        const marginTop = this.nodeList[this.nodesIndex].customNumericStyle.marginTop || 0;
        Object.assign(this.tempBound, {
          width: 0,
          height: this.tempBound.height + marginTop,
        });
        this.prevMarginBottom = 0;
        // 2. 处理子节点
        this.nodeList[this.nodesIndex].children.forEach((child: any) => {
          this.measureTexts(ctx, true, child);
        });
        // 3. 处理容器的 marginBottom
        const marginBottom = this.nodeList[this.nodesIndex].customNumericStyle.marginBottom || 0;
        Object.assign(this.tempBound, {
          width: 0,
          height: this.tempBound.height + marginBottom,
        });
        this.prevMarginBottom = marginBottom;
        this.nodesIndex++;
      } else if (this.nodeList[this.nodesIndex].type === "image") {
        await this.measureImage();
        this.nodesIndex++;
      } else if (this.nodeList[this.nodesIndex].type === "custom") {
        await this.measureCustom();
        this.nodesIndex++;
      } else {
        this.measureTexts(ctx);
        this.nodesIndex++;
      }
    }
    // TODO: 对于inline模式换行的情况，应该要考虑多行容器的 marginTop 和 marginBottom，只让首尾生效
    let tempInlineContainer: any = null;
    this.pages.forEach((page) => {
      page.items = page.items.reduce((prev: any, curr: any) => {
        if (curr.inline) {
          if (curr.inlineStart) {
            tempInlineContainer = {
              ...curr.parentNode,
              children: [curr],
            };
            return prev.concat(tempInlineContainer);
          } else {
            tempInlineContainer.children.push(curr);
            return prev;
          }
        } else {
          return prev.concat(curr);
        }
      }, []);
    });
    this.pages.forEach((page) => {
      page.items = page.items
        .map((item: any) => {
          const result = {
            ...item,
            style: this.getItemStyle(item),
          };
          if (result.children && result.children.length > 0) {
            result.children = result.children.map((child: any) => {
              return {
                ...child,
                style: this.getItemStyle(child),
              };
            });
          }
          return result;
        })
        .filter((item: any) => item.type !== "p" || (item.type === "p" && item.content !== ""));
    });
    return this.pages;
  }
}

export { DocumentPager };
