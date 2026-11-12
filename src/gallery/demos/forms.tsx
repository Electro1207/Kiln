import type { Category } from "../types";
import { AuthDemo, AvatarDemo, ComposerDemo, InlineEditDemo, KeyValueDemo, SettingsDemo } from "./parts/forms";

export const category: Category = {
  id: "forms",
  name: "Forms & flows",
  summary: "Whole patterns built from the inputs: signing in, settings, editing in place, uploads and messages.",
  entries: [
    { id: "auth-forms", name: "Sign in, sign up, reset", summary: "One card for all three; fields come and go and the card eases to its new height.", files: ["src/kiln/components/forms/AuthForms.tsx", "src/kiln/components/text-input/TextField.tsx", "src/kiln/components/text-input/PasswordField.tsx", "src/kiln/components/shared/Field.tsx", "src/kiln/components/buttons/Button.tsx", "src/kiln/controllable.ts", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: AuthDemo },
    { id: "settings-section", name: "Settings section", summary: "Label column beside a panel of controls, and a bar that rises when there are unsaved changes.", files: ["src/kiln/components/forms/SettingsSection.tsx", "src/kiln/components/forms/SaveBar.tsx", "src/kiln/components/buttons/Button.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: SettingsDemo },
    { id: "inline-edit", name: "Inline edit", summary: "Click or press Enter to edit text where it sits; Escape puts it back.", files: ["src/kiln/components/forms/InlineEdit.tsx", "src/kiln/controllable.ts", "src/kiln/cn.ts"], Demo: InlineEditDemo },
    { id: "avatar-upload", name: "Avatar upload and cropper", summary: "Upload, then drag and zoom inside a round frame; the result is a 512px PNG.", files: ["src/kiln/components/forms/AvatarUpload.tsx", "src/kiln/components/forms/ImageCropper.tsx", "src/kiln/components/choice-controls/Slider.tsx", "src/kiln/controllable.ts", "src/kiln/motion.ts", "src/kiln/cn.ts", "src/kiln/components/buttons/Button.tsx"], Demo: AvatarDemo },
    { id: "key-value-editor", name: "Key–value editor", summary: "Environment-variable rows with validation and secrets that stay masked until revealed.", files: ["src/kiln/components/forms/KeyValueEditor.tsx", "src/kiln/controllable.ts", "src/kiln/components/buttons/Button.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: KeyValueDemo },
    { id: "message-composer", name: "Message composer", summary: "Grows with the text, holds attachments, and its send button fills in when there is something to send.", files: ["src/kiln/components/communication/MessageComposer.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: ComposerDemo },
  ],
};
