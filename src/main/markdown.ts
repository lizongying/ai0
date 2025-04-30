import {marked} from 'marked'

let m = `
# 標題

這是文本 3223 *斜體*  ~~刪除~~  ~下劃線~   *斜體*  **粗體** __粗體__

## 二級標題

* 項目1
* 項目2

1. 項目1
2. 項目2

![image](https://github.com/lizongying/)
[link](https://github.com/lizongying/)

---

> 引用
> 引用

\`\`\`
code
    code
\`\`\`
`


let p = marked.parse(m)

console.log(p)