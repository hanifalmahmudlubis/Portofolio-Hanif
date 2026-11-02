import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
export default function PageHeading({
  title,
  description,
  back,
  action,
}: {
  title: string;
  description?: string;
  back?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="mb-8">
      {back && (
        <Link
          href={back}
          className="muted mb-5 inline-flex items-center gap-2 text-xs"
        >
          <ArrowLeft size={14} />
          Kembali
        </Link>
      )}
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <h1 className="text-3xl font-medium tracking-[-.04em]">{title}</h1>
          {description && (
            <p className="muted mt-3 max-w-2xl text-xs leading-6">
              {description}
            </p>
          )}
        </div>
        {action && (
          <Link href={action.href} className="button button-primary">
            <Plus size={15} />
            {action.label}
          </Link>
        )}
      </div>
    </div>
  );
}
