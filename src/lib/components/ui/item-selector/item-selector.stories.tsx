import { ItemSelector } from "./index";
import { ImageCard, IconCard, LanguageCard } from "../../ui";

export default {
  title: "UI/Item Selector",
  component: ItemSelector,
  parameters: {
    layout: "centered",
  },
};

export const Basic = {
  render: () => (
    <ItemSelector
      title="Select an Option"
      subtitle="Choose from the options below"
    >
      <div className="space-y-3">
        <div className="p-4 border rounded-lg">Option 1</div>
        <div className="p-4 border rounded-lg">Option 2</div>
        <div className="p-4 border rounded-lg">Option 3</div>
      </div>
    </ItemSelector>
  ),
};

export const WithSteps = {
  render: () => (
    <div className="space-y-8 max-w-2xl">
      <ItemSelector
        step={1}
        title="Select Avatar"
        subtitle="Choose your avatar for the video"
      >
        <div className="grid grid-cols-2 gap-3">
          <ImageCard
            name="Professional"
            description="Business avatar"
            selected={true}
            onClick={() => console.log("Professional selected")}
          />
          <ImageCard
            name="Casual"
            description="Friendly avatar"
            selected={false}
            onClick={() => console.log("Casual selected")}
          />
        </div>
      </ItemSelector>

      <ItemSelector
        step={2}
        title="Video Type"
        subtitle="Choose the type of video you want to create"
      >
        <div className="grid grid-cols-2 gap-3">
          <IconCard
            title="Talking Head"
            description="Simple presentation"
            selected={false}
            onClick={() => console.log("Talking head selected")}
          />
          <IconCard
            title="Screen Recording"
            description="Screen + voice over"
            selected={true}
            onClick={() => console.log("Screen recording selected")}
            iconBg="bg-green-100"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
            </svg>
          </IconCard>
        </div>
      </ItemSelector>

      <ItemSelector
        step={3}
        title="Language"
        subtitle="Select the language for your video"
      >
        <div className="space-y-3">
          <LanguageCard
            name="English"
            description="Global language"
            selected={true}
            onClick={() => console.log("English selected")}
            isPopular={true}
            flag="🇺🇸"
          />
          <LanguageCard
            name="Spanish"
            description="Widely spoken"
            selected={false}
            onClick={() => console.log("Spanish selected")}
            isPopular={true}
            flag="🇪🇸"
          />
        </div>
      </ItemSelector>
    </div>
  ),
};

export const AvatarSelection = {
  render: () => (
    <ItemSelector
      step={1}
      title="Select Avatar"
      subtitle="Choose your avatar for the video"
    >
      <div className="grid grid-cols-3 gap-4">
        <ImageCard
          name="Professional"
          description="Business appropriate"
          selected={false}
          onClick={() => console.log("Professional selected")}
        />
        <ImageCard
          name="Casual"
          description="Relaxed and friendly"
          selected={true}
          onClick={() => console.log("Casual selected")}
        />
        <ImageCard
          name="Creative"
          description="Artistic and unique"
          selected={false}
          onClick={() => console.log("Creative selected")}
        />
        <ImageCard
          name="Formal"
          description="Traditional business"
          selected={false}
          onClick={() => console.log("Formal selected")}
        />
        <ImageCard
          name="Modern"
          description="Contemporary style"
          selected={false}
          onClick={() => console.log("Modern selected")}
        />
        <ImageCard
          name="Custom"
          description="Upload your own"
          selected={false}
          onClick={() => console.log("Custom selected")}
        />
      </div>
    </ItemSelector>
  ),
};

export const VideoTypeSelection = {
  render: () => (
    <ItemSelector
      step={2}
      title="Video Type"
      subtitle="Choose the type of video you want to create"
    >
      <div className="grid grid-cols-2 gap-4">
        <IconCard
          title="Talking Head"
          description="Simple talking head video"
          selected={true}
          onClick={() => console.log("Talking head selected")}
        />
        <IconCard
          title="Screen Recording"
          description="Record your screen with voice over"
          selected={false}
          onClick={() => console.log("Screen recording selected")}
          iconBg="bg-green-100"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
          </svg>
        </IconCard>
        <IconCard
          title="Animation"
          description="Create animated content"
          selected={false}
          onClick={() => console.log("Animation selected")}
          iconBg="bg-purple-100"
        >
          <svg
            className="w-4 h-4 text-purple-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
              clipRule="evenodd"
            />
          </svg>
        </IconCard>
        <IconCard
          title="Custom Video"
          description="Create your own video type"
          selected={false}
          onClick={() => console.log("Custom video selected")}
          isCustom={true}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
        </IconCard>
      </div>
    </ItemSelector>
  ),
};

export const LanguageSelection = {
  render: () => (
    <ItemSelector
      step={3}
      title="Language"
      subtitle="Select the language for your video"
    >
      <div className="space-y-3">
        <LanguageCard
          name="English"
          description="Global language"
          selected={true}
          onClick={() => console.log("English selected")}
          isPopular={true}
          flag="🇺🇸"
        />
        <LanguageCard
          name="Spanish"
          description="Widely spoken language"
          selected={false}
          onClick={() => console.log("Spanish selected")}
          isPopular={true}
          flag="🇪🇸"
        />
        <LanguageCard
          name="French"
          description="Romance language"
          selected={false}
          onClick={() => console.log("French selected")}
          flag="🇫🇷"
        />
        <LanguageCard
          name="German"
          description="European language"
          selected={false}
          onClick={() => console.log("German selected")}
          flag="🇩🇪"
        />
        <LanguageCard
          name="Japanese"
          description="East Asian language"
          selected={false}
          onClick={() => console.log("Japanese selected")}
          flag="🇯🇵"
        />
        <LanguageCard
          name="Custom Language"
          description="Add your own language"
          selected={false}
          onClick={() => console.log("Custom language selected")}
        >
          <div className="w-6 h-6 bg-purple-100 rounded-sm flex items-center justify-center text-purple-600 text-xs font-semibold">
            +
          </div>
        </LanguageCard>
      </div>
    </ItemSelector>
  ),
};

export const WithoutSteps = {
  render: () => (
    <ItemSelector
      title="Choose Your Preference"
      subtitle="Select from the available options"
    >
      <div className="grid grid-cols-3 gap-4">
        <div className="p-6 border rounded-lg text-center cursor-pointer hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-blue-100 rounded-full mx-auto mb-3 flex items-center justify-center">
            <span className="text-blue-600">🎯</span>
          </div>
          <h3 className="font-medium mb-1">Option A</h3>
          <p className="text-sm text-gray-500">First choice</p>
        </div>
        <div className="p-6 border rounded-lg text-center cursor-pointer hover:shadow-md transition-shadow border-green-500 ring-2 ring-green-200">
          <div className="w-12 h-12 bg-green-100 rounded-full mx-auto mb-3 flex items-center justify-center">
            <span className="text-green-600">⭐</span>
          </div>
          <h3 className="font-medium mb-1">Option B</h3>
          <p className="text-sm text-gray-500">Selected choice</p>
        </div>
        <div className="p-6 border rounded-lg text-center cursor-pointer hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-purple-100 rounded-full mx-auto mb-3 flex items-center justify-center">
            <span className="text-purple-600">🚀</span>
          </div>
          <h3 className="font-medium mb-1">Option C</h3>
          <p className="text-sm text-gray-500">Third choice</p>
        </div>
      </div>
    </ItemSelector>
  ),
};
