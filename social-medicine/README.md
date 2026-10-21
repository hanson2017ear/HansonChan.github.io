# 社会医学课堂计算练习

双击 `index.html` 即可打开。无需安装软件，无需联网，输入内容不上传或保存。

包括：

- QALY 分段计算、课堂例题和计算记录导出。
- EQ-5D-3L 健康状态编码及 VAS 记录练习；不提供未经指定的效用换算。
- 组合危险分数、存在死亡危险、改善前后比较与内插法。
- 评价年龄、增长年龄的课堂解释和原始资料链接。

计算数据取自社会医学课程例题。危险因素计算采用教材历史模型，不用于个人临床风险预测。

在线使用：https://hanson2017ear.github.io/HansonChan.github.io/social-medicine/

- [生命质量评价](https://hanson2017ear.github.io/HansonChan.github.io/social-medicine/#qaly)
- [健康危险因素评价](https://hanson2017ear.github.io/HansonChan.github.io/social-medicine/#hra)

## 计算口径

QALY = Σ（年数 × 健康权重）。

组合危险分数 R = Σ(r > 1 时的 r − 1) + Π(r ≤ 1 时的 r)。存在死亡危险 D = M × R。

默认先将 R 保留两位小数再计算 D，与课件后续例题保持一致；可以取消此选项查看完整精度。内插例题的 0.65 与综合例题表内 0.6 分别使用。

EQ-5D 状态编码、VAS 和效用指数不同。效用值应采用明确的版本和国家／地区价值集；不能把等级直接相加，也不能将 VAS/100 直接作为效用值。

## 来源

1. 李鲁主编：《社会医学》第5版，人民卫生出版社，2017，第11、12章。
2. 社会医学课程课件（2026）：PDF第138—139、165—174页。
3. [EuroQol EQ-5D-3L](https://euroqol.org/information-and-support/euroqol-instruments/eq-5d-3l/)。
4. [EuroQol value sets](https://euroqol.org/information-and-support/resources/value-sets/)。

## 放到 GitHub Pages

本文件夹可直接放入仓库；若使用分支式 Pages，将该目录内容放到被发布的根目录或 docs 目录，按仓库设置选择对应分支和路径。也可以把整个文件夹放进已有的静态站点，访问其子目录。

核心文件是 index.html 和 calc.js，须放在同一目录。其余文件用于说明和验证。

## 验证

安装了 Node.js 的环境中运行 `node test.cjs`。测试覆盖课堂数据、精度选项、分母、边界值和无效输入。
