'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';

import type { TypeWriterProps } from '@/lib/animation/types';

const blink = keyframes`
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0;
  }
`;

const TypeWriterWrapper = styled.span`
  display: inline;
`;

const Cursor = styled.span`
  display: inline-block;
  animation: ${blink} 1s step-end infinite;
  font-weight: 100;
`;

export const TypeWriter = ({
  text,
  speed = 50,
  delay = 0,
  cursor = true,
  cursorChar = '|',
  onComplete,
  className,
}: TypeWriterProps) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const indexRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const typeNextChar = useCallback(() => {
    if (indexRef.current < text.length) {
      setDisplayedText(text.slice(0, indexRef.current + 1));
      indexRef.current++;
      timeoutRef.current = setTimeout(typeNextChar, speed);
    } else {
      setIsComplete(true);
      onCompleteRef.current?.();
    }
  }, [text, speed]);

  useEffect(() => {
    if (hasStarted) return;

    setHasStarted(true);
    indexRef.current = 0;
    setDisplayedText('');
    setIsComplete(false);

    if (delay > 0) {
      timeoutRef.current = setTimeout(() => {
        typeNextChar();
      }, delay);
    } else {
      typeNextChar();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [text, delay, typeNextChar, hasStarted]);

  useEffect(() => {
    setHasStarted(false);
    indexRef.current = 0;
    setDisplayedText('');
    setIsComplete(false);
  }, [text]);

  return (
    <TypeWriterWrapper className={className}>
      {displayedText}
      {cursor && !isComplete && <Cursor>{cursorChar}</Cursor>}
    </TypeWriterWrapper>
  );
};

export type TypeWriterSequenceProps = {
  texts: string[];
  speed?: number;
  pauseBetween?: number;
  loop?: boolean;
  cursor?: boolean;
  cursorChar?: string;
  className?: string;
};

export const TypeWriterSequence = ({
  texts,
  speed = 50,
  pauseBetween = 2000,
  loop = true,
  cursor = true,
  cursorChar = '|',
  className,
}: TypeWriterSequenceProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const charIndexRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentText = texts[currentIndex] ?? '';

  const typeChar = useCallback(() => {
    if (charIndexRef.current < currentText.length) {
      setDisplayedText(currentText.slice(0, charIndexRef.current + 1));
      charIndexRef.current++;
      timeoutRef.current = setTimeout(typeChar, speed);
    } else {
      setIsTyping(false);
      timeoutRef.current = setTimeout(() => {
        charIndexRef.current = 0;
        setDisplayedText('');
        setIsTyping(true);

        if (currentIndex < texts.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else if (loop) {
          setCurrentIndex(0);
        }
      }, pauseBetween);
    }
  }, [currentText, speed, pauseBetween, currentIndex, texts.length, loop]);

  useEffect(() => {
    charIndexRef.current = 0;
    setDisplayedText('');
    setIsTyping(true);
    timeoutRef.current = setTimeout(typeChar, speed);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentIndex, typeChar, speed]);

  return (
    <TypeWriterWrapper className={className}>
      {displayedText}
      {cursor && isTyping && <Cursor>{cursorChar}</Cursor>}
    </TypeWriterWrapper>
  );
};

export default TypeWriter;
