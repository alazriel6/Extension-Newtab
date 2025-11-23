import React, { useEffect, useState } from "react";

export default function RoleManager({ embedded = false }) {
  const [categories, setCategories] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const [newCategory, setNewCategory] = useState("");
  const [newRole, setNewRole] = useState("");

  // Load categories
  useEffect(() => {
    const load = (list) => {
      const fixed = list.map((c) => ({
        ...c,
        enabled: c.enabled ?? true,
      }));
      setCategories(fixed);
    };

    if (process.env.NODE_ENV === "development") {
      const saved = localStorage.getItem("categories");
      if (saved) load(JSON.parse(saved));
      return;
    }

    chrome.storage.local.get(["categories"], (result) => {
      if (result.categories) load(result.categories);
    });
  }, []);

  // Save categories
  const save = (list) => {
    setCategories(list);
    if (chrome?.storage?.local) chrome.storage.local.set({ categories: list });
    else localStorage.setItem("categories", JSON.stringify(list));
  };

  const addCategory = () => {
    if (!newCategory.trim()) return;
    const updated = [
      ...categories,
      { name: newCategory.trim(), roles: [], enabled: true },
    ];
    save(updated);
    setNewCategory("");
    setActiveIndex(updated.length - 1);
  };

  const removeCategory = (index) => {
    const updated = categories.filter((_, i) => i !== index);
    save(updated);
    setActiveIndex(0);
  };

  const toggleCategoryEnabled = (index, value) => {
    const updated = [...categories];
    updated[index].enabled = value;
    save(updated);
  };

  const addRole = () => {
    if (!newRole.trim()) return;
    const updated = [...categories];
    updated[activeIndex].roles.push(newRole.trim());
    save(updated);
    setNewRole("");
  };

  const removeRole = (roleIndex) => {
    const updated = [...categories];
    updated[activeIndex].roles.splice(roleIndex, 1);
    save(updated);
  };

  return (
    <div className="flex gap-4 h-[350px]">

      {/* Sidebar Categories */}
      <div className="w-1/3 bg-white/5 p-4 rounded-xl flex flex-col">
        <h2 className="text-lg font-semibold mb-3">Categories</h2>

        <div className="flex flex-col gap-1 overflow-y-auto">
          {categories.map((cat, i) => (
            <div
              key={i}
              className={`px-3 py-2 rounded-lg cursor-pointer flex justify-between items-center 
              ${i === activeIndex ? "bg-white/20" : "bg-white/10 hover:bg-white/15"}`}
              onClick={() => setActiveIndex(i)}
            >
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={cat.enabled ?? true}
                  onChange={(e) => {
                    e.stopPropagation();
                    toggleCategoryEnabled(i, e.target.checked);
                  }}
                  className="mr-2"
                />
                {cat.name}
              </div>

              <button
                className="text-red-400 hover:text-red-300 ml-2"
                onClick={(e) => {
                  e.stopPropagation();
                  removeCategory(i);
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="New Category"
          className="mt-3 w-full px-3 py-2 rounded-lg bg-white/10 outline-none"
          onKeyDown={(e) => e.key === "Enter" && addCategory()}
        />

        <button
          onClick={addCategory}
          className="w-full mt-2 py-2 bg-blue-500 rounded-lg hover:bg-blue-600"
        >
          Add Category
        </button>
      </div>

      {/* Right Panel Roles */}
      <div className="w-2/3 p-4">
        {categories[activeIndex] ? (
          <>
            <h2 className="text-xl font-semibold mb-3">
              Roles: {categories[activeIndex].name}
            </h2>

            <div className="space-y-2 max-h-[220px] overflow-y-auto">
              {categories[activeIndex].roles.length > 0 ? (
                categories[activeIndex].roles.map((role, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center bg-white/10 px-3 py-2 rounded-lg"
                  >
                    <span>{role}</span>
                    <button
                      className="text-red-400 hover:text-red-300"
                      onClick={() => removeRole(i)}
                    >
                      ✕
                    </button>
                  </div>
                ))
              ) : (
                <p className="opacity-60">No roles in this category.</p>
              )}
            </div>

            <input
              type="text"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              placeholder="Add Role"
              className="w-full px-3 py-2 rounded-lg bg-white/10 outline-none mt-4"
              onKeyDown={(e) => e.key === "Enter" && addRole()}
            />

            <button
              onClick={addRole}
              className="w-full mt-2 py-2 bg-green-600 rounded-lg hover:bg-green-700"
            >
              Add Role
            </button>
          </>
        ) : (
          <p className="opacity-60">No category selected.</p>
        )}
      </div>
    </div>
  );
}
