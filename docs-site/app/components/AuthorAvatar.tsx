import { initials, type AuthorProfile } from "@/app/lib/authors";

export default function AuthorAvatar({ author }: { author: AuthorProfile }) {
  return (
    <span className="author-avatar">
      {author.photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={author.photo} alt={author.name} width={56} height={56} />
      ) : (
        initials(author.name)
      )}
    </span>
  );
}
