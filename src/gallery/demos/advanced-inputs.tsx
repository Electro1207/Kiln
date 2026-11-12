import type { Category } from "../types";
import { BookingDemo, ColorDemo, CurrencyDemo, MentionsDemo, PhoneDemo, RichTextDemo, SignatureDemo } from "./parts/advanced-inputs";

export const category: Category = {
  id: "advanced-inputs",
  name: "Advanced inputs",
  summary: "Inputs that do more work: colour, phone, money, booking, signatures, mentions and rich text.",
  entries: [
    { id: "color-picker", name: "Colour picker", summary: "Saturation and brightness, hue and alpha, typed values, the screen eyedropper where supported, and saved swatches; inline or in a popover.", files: ["src/kiln/components/choice-controls/ColorPicker.tsx", "src/kiln/components/shared/Anchored.tsx", "src/kiln/components/buttons/SegmentedControl.tsx", "src/kiln/controllable.ts", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: ColorDemo },
    { id: "phone-input", name: "Phone input", summary: "A searchable country code and a number that formats as you type, with the caret kept in place.", files: ["src/kiln/components/text-input/PhoneInput.tsx", "src/kiln/components/text-input/caret.ts", "src/kiln/components/shared/Anchored.tsx", "src/kiln/components/shared/Field.tsx", "src/kiln/controllable.ts", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: PhoneDemo },
    { id: "currency-input", name: "Currency input", summary: "Money formatted for the locale as you type; stored in minor units.", files: ["src/kiln/components/text-input/CurrencyInput.tsx", "src/kiln/components/text-input/caret.ts", "src/kiln/components/shared/Field.tsx", "src/kiln/controllable.ts", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: CurrencyDemo },
    { id: "booking-slots", name: "Booking", summary: "Length, day and time in the visitor's time zone, then details and a confirmation.", files: ["src/kiln/components/pickers/BookingSlots.tsx", "src/kiln/components/pickers/DatePicker.tsx", "src/kiln/components/shared/Field.tsx", "src/kiln/controllable.ts", "src/kiln/motion.ts", "src/kiln/cn.ts", "src/kiln/components/shared/Anchored.tsx", "src/kiln/components/data-display/Avatar.tsx", "src/kiln/components/buttons/Button.tsx", "src/kiln/components/text-input/Textarea.tsx", "src/kiln/components/text-input/TextField.tsx", "src/kiln/components/buttons/SegmentedControl.tsx"], Demo: BookingDemo },
    { id: "signature-pad", name: "Signature pad", summary: "Smooth strokes that follow pressure and speed, with undo, clear and PNG export.", files: ["src/kiln/components/pickers/SignaturePad.tsx", "src/kiln/components/buttons/Button.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: SignatureDemo },
    { id: "mentions-textarea", name: "Mentions", summary: "Type @ to suggest people; picked names become tokens.", files: ["src/kiln/components/text-input/MentionsTextarea.tsx", "src/kiln/components/shared/Anchored.tsx", "src/kiln/components/data-display/Avatar.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: MentionsDemo },
    { id: "rich-text-editor", name: "Rich text", summary: "A light editor with a toolbar, shortcuts, markdown shortcuts and clean HTML out.", files: ["src/kiln/components/text-input/RichTextEditor.tsx", "src/kiln/components/shared/Anchored.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts", "src/kiln/components/buttons/Button.tsx"], Demo: RichTextDemo },
  ],
};
