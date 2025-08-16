import React, { useState, useRef, useEffect } from 'react';
import './comp_styles/ComboBox.css';

export default function ComboBox({ options = [], value, onChange, placeholder = '', name, getOptionLabel, getOptionValue }) {
  const [showOptions, setShowOptions] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  const wrapperRef = useRef(null);

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowOptions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    onChange && onChange(e);
    setShowOptions(true);
  };

  const handleOptionClick = (option) => {
    const label = getOptionLabel ? getOptionLabel(option) : (option && option.name ? option.name : option);
    setInputValue(label);
    onChange && onChange({ target: { name, value: getOptionValue ? getOptionValue(option) : label } });
    setShowOptions(false);
  };

  const filterText = inputValue.toLowerCase();
  const filteredOptions = options.filter(opt => {
    const label = getOptionLabel ? getOptionLabel(opt) : (opt && opt.name ? opt.name : opt);
    return label && label.toLowerCase().includes(filterText);
  });

  return (
    <div className="combobox-wrapper" ref={wrapperRef}>
      <input
        className="combobox-input"
        name={name}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setShowOptions(true)}
        placeholder={placeholder}
        autoComplete="off"
      />
      <span className="combobox-arrow" onClick={() => setShowOptions((v) => !v)}>&#9660;</span>
      {showOptions && filteredOptions.length > 0 && (
        <ul className="combobox-options">
          {filteredOptions.map((opt, idx) => (
            <li key={idx} onClick={() => handleOptionClick(opt)}>
              {getOptionLabel ? getOptionLabel(opt) : (opt && opt.name ? opt.name : opt)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
