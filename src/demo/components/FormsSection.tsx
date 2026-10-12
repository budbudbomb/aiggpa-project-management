import React, { useState } from 'react';
import {
  TextBox,
  PasswordBox,
  TextArea,
  NumberBox,
  MaskedBox,
  DropDownList,
  MultiSelectList,
  DatePicker,
  TimePicker,
  Checkbox,
  CheckBoxList,
  RadioList,
  FileUpload,
  Captcha,
  ToggleSwitch,
} from 'shared/components/forms';
import { User } from 'lucide-react';
import { mockDepartmentOptions, mockRoleOptions } from 'services/mockData';

export const FormsSection: React.FC = () => {
  const [selectedDept, setSelectedDept] = useState('Engineering');
  const [selectedRoles, setSelectedRoles] = useState([
    'Administrator',
    'Product Lead',
  ]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedTime, setSelectedTime] = useState<Date | null>(new Date());
  const [hobbies, setHobbies] = useState<(string | number)[]>([
    'reading',
    'coding',
  ]);
  const [gender, setGender] = useState<string | number>('male');
  const [rememberMe, setRememberMe] = useState(true);
  const [notifications, setNotifications] = useState(true);

  const hobbyOptions = [
    { label: 'Coding & Tech', value: 'coding' },
    { label: 'Reading Books', value: 'reading' },
    { label: 'Design & Art', value: 'design' },
  ];

  const genderOptions = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' },
  ];

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          Complete Shared Form Controls Showcase
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Fresh, modern form elements built with 100% Tailwind CSS v4 &
          PrimeReact integrations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <TextBox
          label="TextBox Input"
          placeholder="Enter text..."
          leftIcon={<User className="w-4 h-4" />}
          required
        />

        <PasswordBox
          label="PasswordBox Input"
          placeholder="••••••••"
          helperText="Includes show/hide toggle icon"
        />

        <NumberBox label="NumberBox Input" placeholder="25" min={1} max={100} />

        <MaskedBox
          label="MaskedBox (Aadhar / Card)"
          maskPlaceholder="5432-8765-1098-4321"
        />

        <DropDownList
          label="DropDownList (Single Select)"
          options={mockDepartmentOptions}
          value={selectedDept}
          onChange={val => setSelectedDept(val as string)}
          required
        />

        <MultiSelectList
          label="MultiSelectList (Chips Mode)"
          options={mockRoleOptions}
          value={selectedRoles}
          onChange={vals => setSelectedRoles(vals as string[])}
        />

        <DatePicker
          label="DatePicker"
          value={selectedDate}
          onChange={val => setSelectedDate(val as Date | null)}
        />

        <TimePicker
          label="TimePicker"
          value={selectedTime}
          onChange={val => setSelectedTime(val as Date | null)}
        />

        <div className="md:col-span-2">
          <TextArea
            label="TextArea Multiline"
            placeholder="Type your notes or description here..."
            rows={3}
          />
        </div>

        <CheckBoxList
          label="CheckBoxList (Group)"
          options={hobbyOptions}
          values={hobbies}
          onChange={vals => setHobbies(vals)}
          orientation="horizontal"
        />

        <RadioList
          name="gender-group"
          label="RadioList (Single Choice)"
          options={genderOptions}
          value={gender}
          onChange={val => setGender(val)}
          orientation="horizontal"
        />

        <div className="md:col-span-2">
          <FileUpload
            label="FileUpload Drag & Dropzone"
            maxSizeMB={5}
            accept="image/*,.pdf"
            onChange={() => {}}
          />
        </div>

        <div className="md:col-span-2">
          <Captcha label="Visual Security Captcha" onChange={() => {}} />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <Checkbox
          label="Single Checkbox Option"
          description="Keep me logged in on this machine"
          checked={rememberMe}
          onChange={checked => setRememberMe(checked)}
        />

        <ToggleSwitch
          label="Toggle Switch Component"
          checked={notifications}
          onChange={checked => setNotifications(checked)}
        />
      </div>
    </div>
  );
};
