import { KilnMark } from "../kiln/components/marketing/PoweredByKiln";

/** The gallery's logo: Kiln's own mark, so it always matches the favicon and the PoweredByKiln credit. */
export function Mark({ className = "size-6" }: { className?: string }) {
  return <KilnMark className={className} />;
}
