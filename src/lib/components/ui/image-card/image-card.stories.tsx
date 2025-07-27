import { ImageCard } from "../index";

export default {
  title: "UI/Image Card",
  component: ImageCard,
  parameters: {
    layout: "centered",
  },
};

export const Default = {
  render: () => (
    <div className="w-80">
      <ImageCard
        name="Professional Avatar"
        description="Business appropriate avatar"
        selected={false}
        onClick={() => console.log("Professional avatar selected")}
      />
    </div>
  ),
};

export const Selected = {
  render: () => (
    <div className="w-80">
      <ImageCard
        name="Professional Avatar"
        description="Business appropriate avatar"
        selected={true}
        onClick={() => console.log("Professional avatar selected")}
      />
    </div>
  ),
};

export const WithImage = {
  render: () => (
    <div className="w-80">
      <ImageCard
        name="John Doe"
        description="Professional headshot"
        selected={false}
        image="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
        onClick={() => console.log("John Doe avatar selected")}
      />
    </div>
  ),
};

export const CustomContent = {
  render: () => (
    <div className="w-80">
      <ImageCard
        name="Custom Avatar"
        description="Upload your own avatar"
        selected={false}
        onClick={() => console.log("Custom avatar selected")}
      >
        <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center text-white font-semibold">
          Custom
        </div>
      </ImageCard>
    </div>
  ),
};

export const CustomType = {
  render: () => (
    <div className="w-80">
      <ImageCard
        name="Add New Avatar"
        description="Create a new avatar"
        selected={false}
        onClick={() => console.log("Add new avatar clicked")}
      >
        <div className="w-full aspect-square bg-green-100 rounded-lg">
          <span className="text-green-600 text-3xl">+</span>
        </div>
      </ImageCard>
    </div>
  ),
};

export const Multiple = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 w-96">
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
      <ImageCard
        name="Creative"
        description="Artistic avatar"
        selected={false}
        onClick={() => console.log("Creative selected")}
      />
      <ImageCard
        name="Custom"
        description="Add your own"
        selected={false}
        onClick={() => console.log("Custom selected")}
      />
    </div>
  ),
};
