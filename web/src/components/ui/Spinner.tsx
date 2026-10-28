/** Small inline spinner for buttons. Takes the text colour of the button. */
export function Spinner({ className = "h-4 w-4" }: { className?: string }) {
    return (
        <span
            aria-hidden
            className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
        />
    );
}