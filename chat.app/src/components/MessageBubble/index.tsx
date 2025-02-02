import React from 'react';
import { Message } from '../../types';
import { MessageBubbleContainer } from './styles';

export interface MessageBubbleProps {
    role: Message['role'];
    children: React.ReactNode;
}

const MessageBubble = ({ role, children }: MessageBubbleProps) => {
    return (
        <MessageBubbleContainer role={role}>
            {children}
        </MessageBubbleContainer>
    );
};

export default MessageBubble;
