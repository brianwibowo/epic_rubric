import React from 'react';
import styles from './DimensionWeightSlider.module.css';

const DimensionWeightSlider = ({
  dimension, // {code, name, label, desc, color}
  value,     // decimal value (0 - 1.00)
  onChange,  // returns decimal value
  disabled = false
}) => {
  const percentValue = Math.round(value * 100);

  const handleSliderChange = (e) => {
    const val = Number(e.target.value) / 100;
    onChange(val);
  };

  const handleInputChange = (e) => {
    let val = Number(e.target.value);
    if (val < 0) val = 0;
    if (val > 100) val = 100;
    onChange(val / 100);
  };

  return (
    <div className={styles.sliderRow} style={{ '--dim-color': dimension.color }}>
      <div className={styles.meta}>
        <div className={styles.titleRow}>
          <span className={styles.badge} style={{ backgroundColor: dimension.bgColor, color: dimension.textColor }}>
            {dimension.code}
          </span>
          <h4 className={styles.name}>{dimension.label}</h4>
        </div>
        <p className={styles.desc}>{dimension.desc}</p>
      </div>

      <div className={styles.controls}>
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={percentValue}
          onChange={handleSliderChange}
          disabled={disabled}
          className={styles.slider}
        />
        <div className={styles.inputWrapper}>
          <input
            type="number"
            min="0"
            max="100"
            value={percentValue}
            onChange={handleInputChange}
            disabled={disabled}
            className={styles.numberInput}
          />
          <span className={styles.percentSymbol}>%</span>
        </div>
      </div>
    </div>
  );
};

export default DimensionWeightSlider;
