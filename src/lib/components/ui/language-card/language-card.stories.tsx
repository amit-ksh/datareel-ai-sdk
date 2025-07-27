import { LanguageCard } from "../index";

export default {
  title: "UI/Language Card",
  component: LanguageCard,
  parameters: {
    layout: "centered",
  },
};

export const Default = {
  render: () => (
    <div className="w-80">
      <LanguageCard
        name="English"
        description="Global language"
        selected={false}
        onClick={() => console.log("English selected")}
        flag="🇺🇸"
      />
    </div>
  ),
};

export const Selected = {
  render: () => (
    <div className="w-80">
      <LanguageCard
        name="Spanish"
        description="Widely spoken language"
        selected={true}
        onClick={() => console.log("Spanish selected")}
        isPopular={true}
        flag="🇪🇸"
      />
    </div>
  ),
};

export const Popular = {
  render: () => (
    <div className="w-80">
      <LanguageCard
        name="English"
        description="Global language"
        selected={false}
        onClick={() => console.log("English selected")}
        isPopular={true}
        flag="🇺🇸"
      />
    </div>
  ),
};

export const WithCustomFlag = {
  render: () => (
    <div className="w-80">
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
  ),
};

export const WithoutFlag = {
  render: () => (
    <div className="w-80">
      <LanguageCard
        name="Unknown Language"
        description="Language without flag"
        selected={false}
        onClick={() => console.log("Unknown language selected")}
      />
    </div>
  ),
};

export const List = {
  render: () => (
    <div className="space-y-3 w-80">
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
    </div>
  ),
};

export const PopularLanguages = {
  render: () => (
    <div className="space-y-3 w-80">
      <LanguageCard
        name="English"
        description="Most widely used"
        selected={false}
        onClick={() => console.log("English selected")}
        isPopular={true}
        flag="🇺🇸"
      />
      <LanguageCard
        name="Spanish"
        description="Second most popular"
        selected={false}
        onClick={() => console.log("Spanish selected")}
        isPopular={true}
        flag="🇪🇸"
      />
      <LanguageCard
        name="Mandarin"
        description="Most native speakers"
        selected={true}
        onClick={() => console.log("Mandarin selected")}
        isPopular={true}
        flag="🇨🇳"
      />
    </div>
  ),
};

export const WithCustomContent = {
  render: () => (
    <div className="space-y-3 w-80">
      <LanguageCard
        name="English"
        description="Global standard"
        selected={false}
        onClick={() => console.log("English selected")}
        flag="🇺🇸"
      />
      <LanguageCard
        name="Custom Language"
        description="Add your own"
        selected={false}
        onClick={() => console.log("Custom selected")}
      >
        <div className="w-6 h-6 bg-gradient-to-br from-orange-400 to-red-400 rounded-sm flex items-center justify-center text-white text-xs font-bold">
          ?
        </div>
      </LanguageCard>
    </div>
  ),
};
