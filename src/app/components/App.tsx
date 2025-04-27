import React, { useState, useEffect, useRef } from 'react';
import '../styles/ui.css';
import iconSvg from '../assets/icon.svg';

function App() {
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [warning, setWarning] = useState('');
  const [linkedElement, setLinkedElement] = useState<string | null>(null);
  const [elementType, setElementType] = useState<string | null>(null);
  const [formFocused, setFormFocused] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const typeRef = useRef<HTMLSelectElement>(null);
  const priorityRef = useRef<HTMLSelectElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Listen for messages from the plugin controller
    window.onmessage = (event) => {
      const { type, selectedElement, elementType } = event.data.pluginMessage || {};
      
      if (type === 'selection-updated') {
        setLinkedElement(selectedElement);
        setElementType(elementType);
      } else if (type === 'create-note-success') {
        setIsSubmitting(false);
        // Reset form after successful submission
        if (titleRef.current) titleRef.current.value = '';
        if (descriptionRef.current) descriptionRef.current.value = '';
        if (typeRef.current) typeRef.current.value = '';
        if (priorityRef.current) priorityRef.current.value = '';
        setTags([]);
        setLinkedElement(null);
        setElementType(null);
        
        // Show success animation
        showSuccessAnimation();
      } else if (type === 'error') {
        setIsSubmitting(false);
        setWarning(event.data.pluginMessage.message);
        setTimeout(() => setWarning(''), 3000);
      }
    };

    // Request selection info when component mounts
    parent.postMessage({ pluginMessage: { type: 'get-selection' } }, '*');
    
    // Focus on title input when component mounts
    if (titleRef.current) {
      titleRef.current.focus();
    }
  }, []);
  
  // Function to show success animation
  const showSuccessAnimation = () => {
    const successEl = document.createElement('div');
    successEl.className = 'success-animation';
    successEl.innerHTML = `
      <div class="success-icon">
        <svg viewBox="0 0 24 24" width="80" height="80">
          <path fill="none" stroke="#fff" stroke-width="2" d="M1,12 C1,5.9 5.9,1 12,1 C18.1,1 23,5.9 23,12 C23,18.1 18.1,23 12,23 C5.9,23 1,18.1 1,12 Z"></path>
          <path fill="none" stroke="#fff" stroke-width="2" d="M6,12 L10,16 L18,8"></path>
        </svg>
      </div>
      <div class="success-text">Note Created!</div>
    `;
    document.body.appendChild(successEl);
    
    // Remove the element after animation completes
    setTimeout(() => {
      document.body.removeChild(successEl);
    }, 2000);
  };

  const isFormValid = (): boolean => {
    const title = titleRef.current?.value.trim() || '';
    const description = descriptionRef.current?.value.trim() || '';
    const type = typeRef.current?.value || '';
    const priority = priorityRef.current?.value || '';
    return title !== '' && description !== '' && type !== '' && priority !== '';
  };

  const addTag = () => {
    if (!currentTag.trim()) return;
    
    // Filter out empty tags and duplicates
    const newTagsArray = currentTag.split(',')
      .map(tag => tag.trim())
      .filter(tag => tag !== '' && !tags.includes(tag));
    
    if (tags.length + newTagsArray.length > 3) {
      setWarning('Only 3 tags can be added to each note.');
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
    const title = titleRef.current?.value.trim() || '';
    const description = descriptionRef.current?.value.trim() || '';
    const type = typeRef.current?.value || '';
    const priority = priorityRef.current?.value || '';
    
    if (!isFormValid()) {
      setWarning('Please fill in all required fields.');
      setTimeout(() => setWarning(''), 3000);
      
      // Scroll to the first empty required field
      if (!title && titleRef.current) {
        titleRef.current.focus();
        contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (!description && descriptionRef.current) {
        descriptionRef.current.focus();
        descriptionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (!type && typeRef.current) {
        typeRef.current.focus();
        typeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (!priority && priorityRef.current) {
        priorityRef.current.focus();
        priorityRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
      return;
    }
    
    setIsSubmitting(true);

    parent.postMessage({
      pluginMessage: {
        type: 'create-note',
        title,
        description,
        noteType: type,
        priority,
        tags,
        linkedElement
      }
    }, '*');
  };

  return (
    <div className="container">
      <div className="content-area" ref={contentRef}>
        <div className="header-with-icon">
          <div className="plugin-icon">
            <img src={iconSvg} alt="Blink Notes Icon" width="40" height="40" />
          </div>
          <div className="header-text">
            <h1 className="title"><span className='blink'>Blink</span> <span className='notes'>Notes</span></h1>
            <p className="subtext">Create notes for your Designs in a blink.</p>
          </div>
        </div>
        <div className="divider"></div>
        
        <div className="linked-element">
          {linkedElement ? (
            <div className="linked-badge">
              <span className="linked-icon">🔗</span>
              <span>Linked to selected {elementType || 'element'}</span>
            </div>
          ) : (
            <div className="linked-badge unlinked">
              <span className="linked-icon">⚠️</span>
              <span>Select a Frame or element</span>
            </div>
          )}
        </div>
        
        <div className="form-group">
          <label>Title <span className="required">*</span></label>
          <input 
            ref={titleRef}
            type="text" 
            className="input-field" 
            placeholder="Enter title for your note" 
            onFocus={() => setFormFocused(true)}
            onBlur={() => setFormFocused(false)}
          />
        </div>
        
        <div className="form-group">
          <label>Description <span className="required">*</span></label>
          <textarea
            ref={descriptionRef}
            className="input-field textarea"
            placeholder="Enter detailed description"
            rows={3}
            onFocus={() => setFormFocused(true)}
            onBlur={() => setFormFocused(false)}
          ></textarea>
        </div>
        
        <div className="form-row">
          <div className="form-group half">
            <label>Type <span className="required">*</span></label>
            <select 
              ref={typeRef} 
              className="input-field"
              onFocus={() => setFormFocused(true)}
              onBlur={() => setFormFocused(false)}
            >
              <option value="">Select Type</option>
              <option value="feedback">Feedback</option>
              <option value="bug">Bug</option>
              <option value="idea">Idea</option>
              <option value="task">Task</option>
              <option value="question">Question</option>
            </select>
          </div>
          
          <div className="form-group half">
            <label>Priority <span className="required">*</span></label>
            <select 
              ref={priorityRef} 
              className="input-field"
              onFocus={() => setFormFocused(true)}
              onBlur={() => setFormFocused(false)}
            >
              <option value="">Select Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Tags (Max 3) <span className="required">*</span></label>
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
                onFocus={() => setFormFocused(true)}
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className={`sticky-footer ${formFocused ? 'focused' : ''}`}>
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
            'Create a Blink Note'
          }
        </button>
      </div>

      {warning && <div className="warning-toast">{warning}</div>}
    </div>
  );
}

export default App;