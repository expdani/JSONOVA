import { SerializedStyles, Theme, css } from '@emotion/react';
import styled from '@emotion/styled';
import { Message } from '../../types';

interface MessageStyles {
    styles: SerializedStyles;
}

const baseStyles = (theme: Theme) => ({
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    maxWidth: '80%',
    whiteSpace: 'pre-wrap' as const,
    overflowWrap: 'break-word' as const,
    transition: theme.transitions.default,
});

const roleStyles = {
    assistant: (theme: Theme): MessageStyles => ({
        styles: css({
            ...baseStyles(theme),
            background: theme.colors.secondary,
            color: theme.colors.text,
            marginRight: 'auto',
        })
    }),
    user: (theme: Theme): MessageStyles => ({
        styles: css({
            ...baseStyles(theme),
            background: theme.colors.primary,
            color: theme.colors.text,
            marginLeft: 'auto',
        })
    }),
    system: (theme: Theme): MessageStyles => ({
        styles: css({
            ...baseStyles(theme),
            background: theme.colors.accent,
            color: theme.colors.text,
            margin: '1rem auto',
            padding: theme.spacing.sm,
            borderRadius: theme.borderRadius.sm,
            fontStyle: 'italic',
            textAlign: 'center',
            border: `1px solid ${theme.colors.border}`,
        })
    })
};

export const messageThemeStyle = (theme: Theme, role: Message['role']) => {
    return roleStyles[role](theme);
};

interface MessageBubbleContainerProps {
    role: Message['role'];
}

export const MessageBubbleContainer = styled.div<MessageBubbleContainerProps>(
    ({ theme, role }) => messageThemeStyle(theme, role).styles
);
