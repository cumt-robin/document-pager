# 安装

```shell
npm install document-pager
```

# 使用

```javascript
import DocumentPager from "document-pager";
const pager = new DocumentPager({
  contentMaxWidth: 570,
  contentMaxHeight: 884,
  nodeMeta: {
    h1: {
      numericStyle: {
        fontSize: 24,
        marginTop: 80,
        marginBottom: 30,
      },
      style: {
        lineHeight: 1.5,
        fontWeight: "bold",
        textAlign: "center",
      },
    },
    h2: {
      numericStyle: {
        fontSize: 18,
        marginTop: 20,
        marginBottom: 20,
      },
      style: {
        lineHeight: 1.5,
        fontWeight: "bold",
      },
    },
    h3: {
      numericStyle: {
        fontSize: 16,
        marginTop: 16,
        marginBottom: 16,
      },
      style: {
        lineHeight: 1.5,
        fontWeight: "bold",
      },
    },
    p: {
      numericStyle: {
        fontSize: 16,
      },
      style: {
        lineHeight: 1.8,
      },
    },
    text: {
      numericStyle: {
        fontSize: 16,
      },
      style: {
        lineHeight: 1.8,
      },
    },
  },
});
const pages = pager.calc();
// 使用 pages 数据进行分页渲染...
```
