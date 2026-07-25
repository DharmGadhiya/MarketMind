import { useEffect, useRef, useState } from "react";
import { createChart, ColorType, CandlestickSeries, HistogramSeries } from "lightweight-charts";
import { useTheme } from "../../services/ThemeContext";
import { formatPrice, formatVolume } from "../../Utilities/utils/stockFormat";

const PriceChart = ({ chartData, activeRange = "1d", height }) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candlestickSeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);
  const { theme } = useTheme();

  const [hoverData, setHoverData] = useState(null);

  const chartHeight = height || (typeof window !== "undefined" && window.innerWidth < 640 ? 320 : 450);

  // Initialize tooltips with the latest bar when data changes
  useEffect(() => {
    if (chartData && chartData.length > 0) {
      const lastPoint = chartData[chartData.length - 1];
      setHoverData(lastPoint);
    } else {
      setHoverData(null);
    }
  }, [chartData]);

  useEffect(() => {
    if (!chartContainerRef.current || !chartData || chartData.length === 0) return;

    const isDark = theme === "dark";
    const container = chartContainerRef.current;

    // Create chart
    const chart = createChart(container, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: isDark ? "#94a3b8" : "#6b7280",
        fontFamily: "Plus Jakarta Sans, system-ui, sans-serif",
      },
      grid: {
        vertLines: { color: isDark ? "rgba(255, 255, 255, 0.035)" : "rgba(10, 14, 20, 0.035)" },
        horzLines: { color: isDark ? "rgba(255, 255, 255, 0.035)" : "rgba(10, 14, 20, 0.035)" },
      },
      crosshair: {
        mode: 1, // Normal crosshair
        vertLine: {
          color: isDark ? "rgba(16, 185, 129, 0.3)" : "rgba(10, 140, 91, 0.3)",
          style: 2, // Dashed
        },
        horzLine: {
          color: isDark ? "rgba(16, 185, 129, 0.3)" : "rgba(10, 140, 91, 0.3)",
          style: 2,
        },
      },
      rightPriceScale: {
        borderVisible: false,
        textColor: isDark ? "#94a3b8" : "#6b7280",
        scaleMargins: {
          top: 0.1,
          bottom: 0.25, // Leaves space for volume overlay at the bottom
        },
      },
      timeScale: {
        borderVisible: false,
        textColor: isDark ? "#94a3b8" : "#6b7280",
        timeVisible: true,
        secondsVisible: false,
        tickMarkFormatter: (time) => {
          const date = new Date(time * 1000);
          return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
        },
      },
      width: container.clientWidth,
      height: container.clientHeight || chartHeight,
      localization: {
        priceFormatter: (price) => formatPrice(price),
        timeFormatter: (time) => {
          const date = new Date(time * 1000);
          const isIntraday = activeRange === "1d" || activeRange === "5d";
          
          const day = date.toLocaleDateString("en-IN", { day: "numeric" });
          const month = date.toLocaleDateString("en-IN", { month: "short" });
          const year = date.toLocaleDateString("en-IN", { year: "2-digit" });
          
          const dateStr = `${day} ${month} '${year}`;
          
          if (isIntraday) {
            const timeStr = date.toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }).toLowerCase();
            return `${dateStr} ${timeStr}`;
          }
          return dateStr;
        },
      },
    });

    chartRef.current = chart;

    // Add candlestick series (using lightweight-charts v5 addSeries API)
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: isDark ? "#10b981" : "#0a8c5b",
      downColor: isDark ? "#f43f5e" : "#e11d48",
      borderUpColor: isDark ? "#10b981" : "#0a8c5b",
      borderDownColor: isDark ? "#f43f5e" : "#e11d48",
      wickUpColor: isDark ? "#10b981" : "#0a8c5b",
      wickDownColor: isDark ? "#f43f5e" : "#e11d48",
    });
    candlestickSeriesRef.current = candlestickSeries;

    // Add volume series overlaid (using lightweight-charts v5 addSeries API)
    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceScaleId: "", // Overlay on the same area
      priceFormat: {
        type: "volume",
      },
    });
    volumeSeriesRef.current = volumeSeries;

    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.78, // volume bars occupy bottom 22%
        bottom: 0,
      },
    });

    // Populate data
    const sortedData = [...chartData].sort((a, b) => a.time - b.time);
    
    const candleData = sortedData.map((d) => ({
      time: d.time,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }));

    const volData = sortedData.map((d) => {
      const isUp = d.close >= d.open;
      return {
        time: d.time,
        value: d.volume,
        color: isUp 
          ? (isDark ? "rgba(16, 185, 129, 0.28)" : "rgba(10, 140, 91, 0.28)")
          : (isDark ? "rgba(244, 63, 94, 0.28)" : "rgba(225, 29, 72, 0.28)"),
      };
    });

    candlestickSeries.setData(candleData);
    volumeSeries.setData(volData);

    // Zoom to fit
    chart.timeScale().fitContent();

    // Subscribe to crosshair move
    chart.subscribeCrosshairMove((param) => {
      if (
        !param.point ||
        !param.time ||
        param.point.x < 0 ||
        param.point.x > container.clientWidth ||
        param.point.y < 0 ||
        param.point.y > chartHeight
      ) {
        // Fallback to the latest price when not hover
        if (chartData && chartData.length > 0) {
          setHoverData(chartData[chartData.length - 1]);
        }
      } else {
        const candle = param.seriesData.get(candlestickSeries);
        const volume = param.seriesData.get(volumeSeries);
        if (candle) {
          setHoverData({
            time: param.time,
            open: candle.open,
            high: candle.high,
            low: candle.low,
            close: candle.close,
            volume: volume ? volume.value : 0,
          });
        }
      }
    });

    // Handle container resize
    const resizeObserver = new ResizeObserver((entries) => {
      if (entries.length === 0 || !entries[0].contentRect) return;
      const { width, height } = entries[0].contentRect;
      chart.applyOptions({ 
        width, 
        height: height > 50 ? height : chartHeight 
      });
      chart.timeScale().fitContent();
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [chartData, theme, activeRange]);

  // Format date for legend display
  const getFormattedDate = (time) => {
    if (!time) return "";
    const date = new Date(time * 1000);
    return date.toLocaleString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const hasData = chartData && chartData.length > 0;

  return (
    <div className="relative w-full h-full min-h-[250px] flex-1 flex flex-col justify-end">
      
      {/* FLOATING LEGEND / OHLV INFO */}
      {hoverData && (
        <div className="absolute top-1 left-1 z-10 flex flex-wrap items-center gap-x-4 gap-y-1 bg-bg-1/80 border border-border-custom/50 px-3.5 py-2 rounded-xl backdrop-blur-sm shadow-sm transition-colors text-[10px] sm:text-[11px] font-mono leading-none">
          <span className="text-text-2 font-medium text-xs font-sans block sm:inline mb-0.5 sm:mb-0">
            {getFormattedDate(hoverData.time)}
          </span>
          <div className="flex gap-3">
            <div>
              <span className="text-text-3 mr-1">O:</span>
              <span className="text-text-0 font-bold">{formatPrice(hoverData.open)}</span>
            </div>
            <div>
              <span className="text-text-3 mr-1">H:</span>
              <span className="text-text-0 font-bold">{formatPrice(hoverData.high)}</span>
            </div>
            <div>
              <span className="text-text-3 mr-1">L:</span>
              <span className="text-text-0 font-bold">{formatPrice(hoverData.low)}</span>
            </div>
            <div>
              <span className="text-text-3 mr-1">C:</span>
              <span className={`font-bold ${hoverData.close >= hoverData.open ? "text-bull" : "text-bear"}`}>
                {formatPrice(hoverData.close)}
              </span>
            </div>
            <div className="hidden sm:block">
              <span className="text-text-3 mr-1">V:</span>
              <span className="text-text-0 font-bold">{formatVolume(hoverData.volume)}</span>
            </div>
          </div>
        </div>
      )}

      {/* CHART DIV */}
      {hasData ? (
        <div ref={chartContainerRef} className="w-full h-[450px]" />
      ) : (
        <div className="flex h-[450px] w-full flex-col items-center justify-center border border-dashed border-border-custom rounded-2xl bg-bg-1 transition-colors">
          <div className="text-center space-y-2 max-w-sm px-6">
            <span className="text-4xl">📊</span>
            <h4 className="font-serif text-lg text-text-0 font-bold">No Chart Data Available</h4>
            <p className="text-xs text-text-2">
              We couldn't retrieve time-series chart data from Yahoo Finance for this stock. It might be due to market closure or API restrictions.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};

export default PriceChart;
