import type { Category } from "../types";
import { CheckboxDemo, NumberDemo, OTPDemo, PasswordDemo, RadioDemo, RatingDemo, SearchDemo, SliderDemo, SwatchDemo, SwitchDemo, TextFieldDemo, TextareaDemo } from "./parts/inputs";

export const category: Category = {
  id: "inputs",
  name: "Inputs",
  summary: "Things people type into, tick and drag.",
  entries: [
    { id: "text-field", name: "Text field", summary: "Label above, hint below; errors arrive with a small shake, and a clear button appears once there is text.", files: ["src/kiln/components/text-input/TextField.tsx", "src/kiln/components/shared/Field.tsx", "src/kiln/controllable.ts", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: TextFieldDemo },
    { id: "textarea", name: "Textarea", summary: "Grows smoothly with its text and counts characters against a limit.", files: ["src/kiln/components/text-input/Textarea.tsx", "src/kiln/components/shared/Field.tsx", "src/kiln/controllable.ts", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: TextareaDemo },
    { id: "password-field", name: "Password field", summary: "Show and hide, plus a strength meter and the rules it is measured against.", files: ["src/kiln/components/text-input/PasswordField.tsx", "src/kiln/components/shared/Field.tsx", "src/kiln/controllable.ts", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: PasswordDemo },
    { id: "search-field", name: "Search field", summary: "A rounded search box with a shortcut hint at rest and a clear button once typed in.", files: ["src/kiln/components/text-input/SearchField.tsx", "src/kiln/controllable.ts", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: SearchDemo },
    { id: "checkbox", name: "Checkbox", summary: "A drawn tick, an indeterminate dash, and a group with select all.", files: ["src/kiln/components/choice-controls/Checkbox.tsx", "src/kiln/components/choice-controls/CheckboxGroup.tsx", "src/kiln/controllable.ts", "src/kiln/cn.ts", "src/kiln/motion.ts"], Demo: CheckboxDemo },
    { id: "radio-group", name: "Radio group", summary: "One choice from a short list, as rows or as tiles whose ring fades in place.", files: ["src/kiln/components/choice-controls/RadioGroup.tsx", "src/kiln/controllable.ts", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: RadioDemo },
    { id: "switch", name: "Switch", summary: "On or off, taking effect at once. The thumb stretches while pressed.", files: ["src/kiln/components/choice-controls/Switch.tsx", "src/kiln/controllable.ts", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: SwitchDemo },
    { id: "slider", name: "Slider", summary: "One value or a range, with a value bubble while dragging and full keyboard steps.", files: ["src/kiln/components/choice-controls/Slider.tsx", "src/kiln/controllable.ts", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: SliderDemo },
    { id: "number-field", name: "Number field", summary: "A stepper whose digits roll; hold a button to count quickly, or type a number.", files: ["src/kiln/components/text-input/NumberField.tsx", "src/kiln/controllable.ts", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: NumberDemo },
    { id: "otp-input", name: "One-time code", summary: "Six boxes on one real input, so paste and SMS autofill work.", files: ["src/kiln/components/text-input/OTPInput.tsx", "src/kiln/controllable.ts", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: OTPDemo },
    { id: "rating", name: "Rating", summary: "Stars with a hover preview and a small wave when picked.", files: ["src/kiln/components/choice-controls/Rating.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: RatingDemo },
    { id: "color-swatches", name: "Colour swatches", summary: "Pick one colour from a set; the ring fades onto it.", files: ["src/kiln/components/choice-controls/ColorSwatches.tsx", "src/kiln/controllable.ts", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: SwatchDemo },
  ],
};
