import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Camera, Trash2, Upload } from "lucide-react";
import { cn } from "../../cn";
import { fade, springSoft } from "../../motion";
import { Button } from "../buttons/Button";
import { ImageCropper, type ImageCropperHandle, type ImageCropperLabels } from "./ImageCropper";

/** Text used by AvatarUpload. Pass a partial via `labels` to translate or reword. */
export interface AvatarUploadLabels {
  /** aria-label of the avatar when a picture is set, given the name. */
  picture: (name: string) => string;
  /** aria-label of the avatar when there is no picture, given the name. */
  noPicture: (name: string) => string;
  upload: string;
  sample: string;
  remove: string;
  /** Helper text under the buttons. */
  hint: string;
  /** Error for an unsupported file type. */
  badType: string;
  /** Error for a file that is too large. */
  tooLarge: string;
  cancel: string;
  /** Confirm button of the cropper. */
  use: string;
}
export const avatarUploadLabels: AvatarUploadLabels = {
  picture: (name) => `${name}'s picture`,
  noPicture: (name) => `${name}, no picture`,
  upload: "Upload picture",
  sample: "Try a sample",
  remove: "Remove",
  hint: "PNG, JPG, WebP or GIF, up to 8 MB.",
  badType: "Choose a PNG, JPG, WebP or GIF.",
  tooLarge: "That file is over 8 MB.",
  cancel: "Cancel",
  use: "Use this picture",
};

export interface AvatarUploadIcons {
  /** Upload button. */
  upload: ReactNode;
  /** Sample-picture button. */
  sample: ReactNode;
  /** Remove button. */
  remove: ReactNode;
}
export const avatarUploadIcons: AvatarUploadIcons = { upload: <Upload />, sample: <Camera />, remove: <Trash2 /> };

/**
 * A round avatar with upload, crop and remove. The cropper opens beneath it;
 * the saved picture cross-fades into the avatar.
 */
export function AvatarUpload({
  value, onChange, name, size = 96, className, sample, labels, cropperLabels, icons,
}: {
  /** Current picture as a URL or data URL; null shows initials. */
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  /** Used for the initials and the accessible name. */
  name: string;
  size?: number;
  className?: string;
  /** Optional picture to try the cropper with when no file is at hand. */
  sample?: () => string;
  /** Override any UI text. Merged over `avatarUploadLabels`. */
  labels?: Partial<AvatarUploadLabels>;
  /** Text for the cropper that opens beneath the avatar. */
  cropperLabels?: Partial<ImageCropperLabels>;
  /** Replace any built-in icon. Merged over `avatarUploadIcons`. */
  icons?: Partial<AvatarUploadIcons>;
}) {
  const l = { ...avatarUploadLabels, ...labels };
  const ic = { ...avatarUploadIcons, ...icons };
  const file = useRef<HTMLInputElement>(null);
  const cropper = useRef<ImageCropperHandle>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");

  useEffect(() => () => { if (editing?.startsWith("blob:")) URL.revokeObjectURL(editing); }, [editing]);

  const pick = (f: File | undefined) => {
    if (!f) return;
    if (!/^image\/(png|jpe?g|webp|gif)$/.test(f.type)) { setError(l.badType); return; }
    if (f.size > 8 * 1024 * 1024) { setError(l.tooLarge); return; }
    setError(null);
    setEditing(URL.createObjectURL(f));
  };

  const save = () => {
    const url = cropper.current?.toDataURL(512);
    if (url) onChange(url);
    setEditing(null);
  };

  return (
    <div className={cn("flex w-full flex-col items-center gap-5", className)}>
      <div className="flex flex-wrap items-center justify-center gap-5">
        <div
          className="relative grid shrink-0 place-items-center overflow-hidden rounded-full bg-btn-secondary text-btn-secondary-ink [&>*]:[grid-area:1/1]"
          style={{ width: size, height: size }}
          role="img"
          aria-label={value ? l.picture(name) : l.noPicture(name)}
        >
          <span className="font-medium" style={{ fontSize: size * 0.34 }}>{initials}</span>
          <AnimatePresence initial={false}>
            {value && (
              <motion.img decoding="async" key={value} src={value} alt="" className="size-full object-cover" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={fade} />
            )}
          </AnimatePresence>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" leading={ic.upload} onClick={() => file.current?.click()}>{l.upload}</Button>
            {sample && <Button size="sm" variant="ghost" leading={ic.sample} onClick={() => { setError(null); setEditing(sample()); }}>{l.sample}</Button>}
            {value && <Button size="sm" variant="ghost" leading={ic.remove} onClick={() => onChange(null)}>{l.remove}</Button>}
          </div>
          <p className={cn("text-[13px]", error ? "text-negative" : "text-muted")} role={error ? "alert" : undefined}>
            {error ?? l.hint}
          </p>
        </div>
        <input ref={file} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="sr-only" tabIndex={-1} aria-hidden
          onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ""; }} />
      </div>
      <AnimatePresence initial={false}>
        {editing && (
          <motion.div
            key="crop"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8, transition: { duration: 0.15 } }}
            transition={springSoft}
            className="flex w-full max-w-sm flex-col items-center gap-5 rounded-sheet bg-surface p-5"
          >
            <ImageCropper ref={cropper} src={editing} size={208} labels={cropperLabels} />
            <div className="flex w-full justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>{l.cancel}</Button>
              <Button size="sm" onClick={save}>{l.use}</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
