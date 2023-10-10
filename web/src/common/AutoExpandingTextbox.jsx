import React, { useState, useRef, useEffect } from 'react';
import '..assets/css/AutoExpandingTextbox.css';

const AutoExpandingTextbox = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef(null);

  const handleClickInside = () => {
    setIsExpanded(true);
  };

  const handleClickOutside = (event) => {
    if (inputRef.current && !inputRef.current.contains(event.target)) {
      setIsExpanded(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div className="input-container">
      <input
        type="text"
        ref={inputRef}
        className={`expandable-input ${isExpanded ? 'expanded' : ''}`}
        placeholder="Type here..."
        onClick={handleClickInside}
      />
    </div>
  );
};

export default AutoExpandingTextbox;
