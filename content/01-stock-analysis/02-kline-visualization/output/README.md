# output 目录

这个目录用于存放 `main.py` 运行后生成的图表文件。

运行 `python main.py` 后，会在这里看到：

- `simple_kline.png` — 基础 K 线图
- `kline_with_volume.png` — 带成交量的 K 线图
- `kline_with_ma.png` — 带成交量和均线的 K 线图

这些图片由 matplotlib 和 mplfinance 自动生成，不需要手动创建。
