import React, { memo, useState, useContext } from 'react';
import { Handle, Position, NodeResizer } from '@xyflow/react';
import { NodeActionContext } from '../../context/NodeActionContext';

const AnnotationNode = ({ data, selected, id }) => {
  const { updateNodeData } = useContext(NodeActionContext);
  const isTextNote = data.variant === 'note';
  
  const onChange = (evt) => {
    updateNodeData(id, { [evt.target.name]: evt.target.value });
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: isTextNote ? 'transparent' : (data.color || 'rgba(56, 189, 248, 0.1)'),
      border: isTextNote ? 'none' : `2px dashed ${data.borderColor || 'rgba(255,255,255,0.2)'}`,
      borderRadius: data.variant === 'circle' ? '50%' : '12px',
      padding: '15px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: isTextNote ? 'flex-start' : 'center',
      justifyContent: isTextNote ? 'flex-start' : 'flex-start',
      color: 'white',
      position: 'relative'
    }}>
      <NodeResizer 
        color="var(--accent-blue)" 
        isVisible={selected} 
        minWidth={100} 
        minHeight={100}
      />
      
      {selected ? (
        <input 
          name="label"
          value={data.label} 
          onChange={onChange}
          placeholder={isTextNote ? "Note Title..." : "Area Name..."}
          style={{
            background: 'rgba(0,0,0,0.2)',
            border: 'none',
            color: 'white',
            fontWeight: '900',
            fontSize: isTextNote ? '1.2rem' : '0.8rem',
            width: '100%',
            outline: 'none',
            textTransform: 'uppercase',
            textAlign: data.variant === 'circle' ? 'center' : 'left'
          }}
        />
      ) : (
        <div style={{ 
          fontWeight: '900', 
          fontSize: isTextNote ? '1.2rem' : '0.8rem', 
          opacity: data.label ? 0.8 : 0.3,
          textTransform: 'uppercase',
          letterSpacing: '1px',
          width: '100%',
          textAlign: data.variant === 'circle' ? 'center' : 'left',
          fontStyle: data.label ? 'normal' : 'italic'
        }}>
          {data.label || (isTextNote ? 'NOTE TITLE' : 'UNNAMED AREA')}
        </div>
      )}

      {isTextNote && (
        selected ? (
          <textarea
            name="description"
            value={data.description}
            onChange={onChange}
            placeholder="Add your description here..."
            style={{
              background: 'rgba(0,0,0,0.1)',
              border: 'none',
              color: 'var(--text-secondary)',
              fontSize: '0.9rem',
              width: '100%',
              height: '100%',
              resize: 'none',
              marginTop: '8px',
              outline: 'none'
            }}
          />
        ) : (
          <div style={{ 
            fontSize: '0.9rem', 
            color: 'var(--text-secondary)', 
            marginTop: '8px',
            fontWeight: '500',
            opacity: data.description ? 1 : 0.4
          }}>
            {data.description || 'No description added...'}
          </div>
        )
      )}
    </div>
  );
};

export default memo(AnnotationNode);
