import React from "react";

export default {
  title: "Brand Color/Examples",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Examples showing how to use the brand color CSS variables in different scenarios.",
      },
    },
  },
};

export const AllExamples = () => {
  return (
    <div className="space-y-8 p-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Brand Color Usage Examples</h2>
        <p className="text-gray-600 mb-6">
          These examples show how to use the --datareel-brand-color CSS variable
          and utility classes.
        </p>
      </div>

      {/* Utility Classes */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Using Utility Classes</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-brand text-white rounded-lg">
            <p className="font-medium">Primary Background</p>
            <p className="text-sm opacity-90">bg-brand</p>
          </div>
          <div className="p-4 bg-brand-light border border-brand rounded-lg">
            <p className="font-medium text-brand">Light Background</p>
            <p className="text-sm text-gray-600">bg-brand-light border-brand</p>
          </div>
          <div className="p-4 border-2 border-brand rounded-lg">
            <p className="font-medium text-brand">Border Only</p>
            <p className="text-sm text-gray-600">border-brand text-brand</p>
          </div>
        </div>
      </section>

      {/* CSS Variables */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Using CSS Variables Directly</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            className="p-4 text-white rounded-lg"
            style={{ backgroundColor: "var(--datareel-brand-color)" }}
          >
            <p className="font-medium">Inline Styles</p>
            <p className="text-sm opacity-90">var(--datareel-brand-color)</p>
          </div>
          <div
            className="p-4 rounded-lg"
            style={{
              backgroundColor: "var(--datareel-brand-color-light)",
              color: "var(--datareel-brand-color)",
              border: "1px solid var(--datareel-brand-color)",
            }}
          >
            <p className="font-medium">Multiple Variables</p>
            <p className="text-sm opacity-75">Light + border + text</p>
          </div>
          <div
            className="p-4 rounded-lg border"
            style={{
              color: "var(--datareel-brand-color)",
              borderColor: "var(--datareel-brand-color)",
            }}
          >
            <p className="font-medium">Text + Border</p>
            <p className="text-sm text-gray-600">Color variables only</p>
          </div>
        </div>
      </section>

      {/* Interactive Elements */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Interactive Elements</h3>
        <div className="flex flex-wrap gap-4">
          <button className="px-4 py-2 bg-brand text-white rounded hover:bg-brand-hover transition-colors">
            Primary Button
          </button>
          <button className="px-4 py-2 border-2 border-brand text-brand rounded hover:bg-brand-light transition-colors">
            Outline Button
          </button>
          <button className="px-4 py-2 bg-brand-light text-brand rounded hover:bg-brand hover:text-white transition-colors">
            Light Button
          </button>
        </div>
      </section>

      {/* Form Elements */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Form Elements</h3>
        <div className="max-w-md space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Brand Focused Input
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-md focus:ring-2 ring-brand focus:border-brand outline-none"
              placeholder="Focus to see brand color"
            />
          </div>
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="rounded"
                style={{
                  accentColor: "var(--datareel-brand-color)",
                }}
              />
              <span>Checkbox with brand accent</span>
            </label>
          </div>
        </div>
      </section>

      {/* Status Indicators */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Status Indicators</h3>
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-brand rounded-full"></div>
            <span>Active Status</span>
          </div>
          <div className="px-3 py-1 bg-brand-light text-brand rounded-full text-sm">
            Brand Badge
          </div>
          <div className="relative">
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-brand rounded-full border-2 border-white"></div>
          </div>
        </div>
      </section>

      {/* Progress and Loading */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Progress & Loading</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Progress</span>
              <span>75%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-brand"
                style={{ width: "75%" }}
              ></div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div
              className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
              style={{
                borderColor:
                  "var(--datareel-brand-color) transparent transparent transparent",
              }}
            ></div>
            <span>Loading with brand color...</span>
          </div>
        </div>
      </section>

      {/* Cards and Layouts */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Cards & Layouts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border-l-4 border-brand bg-brand-light p-4 rounded-r-lg">
            <h4 className="font-medium text-brand">Featured Card</h4>
            <p className="text-sm text-gray-600 mt-1">
              Card with brand color accent border and light background.
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="h-2 bg-brand"></div>
            <div className="p-4">
              <h4 className="font-medium">Header Accent</h4>
              <p className="text-sm text-gray-600 mt-1">
                Card with brand color header strip.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Code Example */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">CSS Variable Reference</h3>
        <div className="bg-gray-100 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Available CSS Variables:</h4>
          <ul className="text-sm font-mono space-y-1">
            <li>
              <code>--datareel-brand-color</code> - Main brand color
            </li>
            <li>
              <code>--datareel-brand-color-hover</code> - Darker shade for hover
              states
            </li>
            <li>
              <code>--datareel-brand-color-light</code> - Light background
              variant
            </li>
            <li>
              <code>--datareel-brand-color-ring</code> - For focus rings
            </li>
          </ul>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Utility Classes:</h4>
          <ul className="text-sm font-mono space-y-1">
            <li>
              <code>.bg-brand</code> - Background with brand color
            </li>
            <li>
              <code>.bg-brand-hover:hover</code> - Hover background
            </li>
            <li>
              <code>.bg-brand-light</code> - Light background
            </li>
            <li>
              <code>.text-brand</code> - Text with brand color
            </li>
            <li>
              <code>.border-brand</code> - Border with brand color
            </li>
            <li>
              <code>.ring-brand</code> - Focus ring with brand color
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
};
