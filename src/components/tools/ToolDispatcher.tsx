import React from 'react';
import { ToolDefinition } from '../../types';
import { PdfTools } from './PdfTools';
import { ImageTools } from './ImageTools';
import { TextTools } from './TextTools';
import { DeveloperTools } from './DeveloperTools';
import { AiTools } from './AiTools';
import { CalculatorTools } from './CalculatorTools';
import { ConverterTools } from './ConverterTools';
import { UtilityTools } from './UtilityTools';

interface ToolDispatcherProps {
  tool: ToolDefinition;
}

export const ToolDispatcher: React.FC<ToolDispatcherProps> = ({ tool }) => {
  if (tool.category === 'pdf') {
    return <PdfTools tool={tool} />;
  }
  if (tool.category === 'image') {
    return <ImageTools tool={tool} />;
  }
  if (tool.category === 'text') {
    return <TextTools tool={tool} />;
  }
  if (tool.category === 'developer') {
    return <DeveloperTools tool={tool} />;
  }
  if (tool.category === 'ai' || tool.requiresAI) {
    return <AiTools tool={tool} />;
  }
  if (tool.category === 'calculators' || tool.id === 'random-number-generator') {
    return <CalculatorTools tool={tool} />;
  }
  if (tool.category === 'converters') {
    return <ConverterTools tool={tool} />;
  }
  return <UtilityTools tool={tool} />;
};
