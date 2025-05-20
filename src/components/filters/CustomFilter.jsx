"use client";

import { Fragment, useState } from "react";
import { Combobox, Transition } from "@headlessui/react";
import { types, ageGroups, sizes } from "@/constants";

const CustomFilter = ({ setFilter, filterType }) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false); // Додаємо стан для відкриття/закриття
  
  const filterData = {
    type: { data: types, placeholder: "Оберіть тип..." },
    age: { data: ageGroups, placeholder: "Оберіть вік..." },
    size: { data: sizes, placeholder: "Оберіть розмір..." }
  }[filterType];

  const filteredOptions = query === ""
    ? filterData.data
    : filterData.data.filter(item => 
        item.toLowerCase().includes(query.toLowerCase())
      );

  return (
    <div className="w-full">
      <Combobox 
        onChange={setFilter}
        onFocus={() => setIsOpen(true)} // Відкриваємо при фокусі
        onBlur={() => setIsOpen(false)} // Закриваємо при втраті фокусу
      >
        <div className="relative">
          <Combobox.Input
            className="custom-filter__input"
            displayValue={(item) => item}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={filterData.placeholder}
            onClick={() => setIsOpen(true)} // Відкриваємо при кліку
          />
          
          <Transition
            show={isOpen} // Контролюємо відображення через стан
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Combobox.Options 
              className="custom-filter__options"
              static // Додаємо static для постійного відображення при isOpen
            >
              {filteredOptions.length === 0 && query !== '' ? (
                <div className="px-4 py-2 text-gray-500">Нічого не знайдено</div>
              ) : (
                filteredOptions.map((item) => (
                  <Combobox.Option
                    key={item}
                    value={item}
                    className={({ active }) => 
                      `px-4 py-2 cursor-pointer ${
                        active ? 'bg-blue-100 text-blue-800' : 'text-gray-800'
                      }`
                    }
                  >
                    {item}
                  </Combobox.Option>
                ))
              )}
            </Combobox.Options>
          </Transition>
        </div>
      </Combobox>
    </div>
  );
};

export default CustomFilter;