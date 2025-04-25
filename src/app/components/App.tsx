import React, { useState, useEffect } from 'react';
import '../styles/ui.css';

function App() {
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [warning, setWarning] = useState('');
  const headlineRef = React.useRef<HTMLInputElement>(null);
  const descriptionRef = React.useRef<HTMLInputElement>(null);
  const priorityRef = React.useRef<HTMLSelectElement>(null);

  useEffect(() => {
    // Listen for messages from the plugin controller
    window.onmessage = (event) => {
      const { type } = event.data.pluginMessage || {};
      if (type === 'create-sticky-note') {
        setIsSubmitting(false);
        // Reset form after successful submission
        if (headlineRef.current) headlineRef.current.value = '';
        if (descriptionRef.current) descriptionRef.current.value = '';
        if (priorityRef.current) priorityRef.current.value = '';
        setTags([]);
      }
    };
  }, []);

  const isFormValid = (): boolean => {
    const head = headlineRef.current?.value.trim() || '';
    const desc = descriptionRef.current?.value.trim() || '';
    const priority = priorityRef.current?.value || '';
    return head !== '' && desc !== '' && priority !== '';
  };

  const addTag = () => {
    if (!currentTag.trim()) return;
    
    // Filter out empty tags and duplicates
    const newTagsArray = currentTag.split(',')
      .map(tag => tag.trim())
      .filter(tag => tag !== '' && !tags.includes(tag));
    
    if (tags.length + newTagsArray.length > 3) {
      setWarning('Only 3 tags can be added to each note card.');
      setTimeout(() => setWarning(''), 3000);
      return;
    }
    
    setTags([...tags, ...newTagsArray]);
    setCurrentTag('');
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const onCreate = () => {
    const headline = headlineRef.current?.value.trim() || '';
    const description = descriptionRef.current?.value.trim() || '';
    const priority = priorityRef.current?.value || '';
    
    if (!headline || !description || !priority) {
      return;
    }
    
    setIsSubmitting(true);

    parent.postMessage({
      pluginMessage: {
        type: 'create-sticky-note',
        headline,
        description,
        tags,
        priority
      }
    }, '*');
  };

  return (
    <div className="container">
      <h1 className="title">Notes Generator</h1>
      <div className="divider"></div>
      
      <div className="form-group">
        <label>Headline</label>
        <input 
          ref={headlineRef}
          type="text" 
          className="input-field" 
          placeholder="Enter headline for your note" 
        />
      </div>
      
      <div className="form-group">
        <label>Description</label>
        <input
          ref={descriptionRef}
          type="text"
          className="input-field"
          placeholder="Enter description details"
        />
      </div>
      
      <div className="form-group">
        <label>Tags (Max 3)</label>
        <div className="tags-input-container">
          <div className="tags-list">
            {tags.map((tag, index) => (
              <div key={index} className="tag">
                {tag}
                <span className="tag-close" onClick={() => removeTag(index)}>×</span>
              </div>
            ))}
            <input
              type="text"
              className="input-field tag-input"
              placeholder={tags.length ? "" : "Type and press Enter to add tags"}
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={addTag}
            />
          </div>
        </div>
      </div>
      
      <div className="form-group">
        <label>Priority</label>
        <select ref={priorityRef} className="input-field">
          <option value="">Select Priority</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>
      
      <button
        className="submit-button"
        onClick={onCreate}
        disabled={!isFormValid() || isSubmitting}
      >
        {isSubmitting ? 
          <span className="loading-text">
            <span className="loading-spinner"></span>
            Creating Note...
          </span> : 
          'Create Note'
        }
      </button>

      {warning && <div className="warning-toast">{warning}</div>}
    </div>
  );
}

export default App;