import React from 'react';

const HtmlToPlainText = ({ htmlContent }) => {
  const convertToPlainText = (html) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    return doc.body.textContent;
  };

  const plainText = convertToPlainText(htmlContent);

  return (
    <textarea
      style={{ height: "200px" }}
      readOnly={true}
      value={plainText}
      className="form-control"
      id="remarks"
      name="remarks"
      rows="10"
    />
  );
};

export default HtmlToPlainText;