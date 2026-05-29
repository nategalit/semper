interface Props {
  message: string;
}

export function EmptyState({ message }: Props) {
  return (
    <p className="text-sm text-stone-500 text-center py-6">{message}</p>
  );
}
