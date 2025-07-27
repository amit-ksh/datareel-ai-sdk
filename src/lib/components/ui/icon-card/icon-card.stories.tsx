import { IconCard } from "../index";

export default {
  title: "UI/Icon Card",
  component: IconCard,
  parameters: {
    layout: "centered",
  },
};

export const Default = {
  render: () => (
    <div className="w-80">
      <IconCard
        title="Talking Head"
        description="Simple talking head video"
        selected={false}
        onClick={() => console.log("Talking head selected")}
      />
    </div>
  ),
};

export const Selected = {
  render: () => (
    <div className="w-80">
      <IconCard
        title="Screen Recording"
        description="Record your screen with voice over"
        selected={true}
        onClick={() => console.log("Screen recording selected")}
        iconBg="bg-green-100"
      />
    </div>
  ),
};

export const WithCustomIcon = {
  render: () => (
    <div className="w-80">
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
    </div>
  ),
};

export const CustomType = {
  render: () => (
    <div className="w-80">
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
  ),
};

export const DifferentBackgrounds = {
  render: () => (
    <div className="space-y-4 w-80">
      <IconCard
        title="Live Stream"
        description="Stream live video"
        selected={false}
        iconBg="bg-red-100"
        onClick={() => console.log("Live stream selected")}
      >
        <svg
          className="w-4 h-4 text-red-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
        </svg>
      </IconCard>

      <IconCard
        title="Animation"
        description="Create animated content"
        selected={false}
        iconBg="bg-purple-100"
        onClick={() => console.log("Animation selected")}
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
        title="Presentation"
        description="Slideshow presentation"
        selected={true}
        iconBg="bg-blue-100"
        onClick={() => console.log("Presentation selected")}
      >
        <svg
          className="w-4 h-4 text-blue-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M3 4a1 1 0 011-1h12a1 1 0 011 1v8a1 1 0 01-1 1h-5v2a1 1 0 01-1 1H8a1 1 0 01-1-1v-2H4a1 1 0 01-1-1V4zm2 3a1 1 0 000 2h10a1 1 0 100-2H5zm0 4a1 1 0 100 2h4a1 1 0 100-2H5z"
            clipRule="evenodd"
          />
        </svg>
      </IconCard>
    </div>
  ),
};

export const Grid = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 w-96">
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
      <IconCard
        title="Animation"
        description="Animated content"
        selected={false}
        iconBg="bg-purple-100"
        onClick={() => console.log("Animation selected")}
      />
      <IconCard
        title="Custom"
        description="Add your own"
        selected={false}
        isCustom={true}
        onClick={() => console.log("Custom selected")}
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
  ),
};
