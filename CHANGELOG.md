# Changelog

## [1.1.0](https://github.com/amit-ksh/datareel-ai-sdk/compare/v1.0.0...v1.1.0) (2025-08-30)


### Features

* add AvatarUploadGuidelines component and integrate pipeline data fetching ([e313718](https://github.com/amit-ksh/datareel-ai-sdk/commit/e313718f0866ebbfb8a4bbe3609f8003508f75fd))
* add delete and update persona functionality in DataReel class ([5cd75a7](https://github.com/amit-ksh/datareel-ai-sdk/commit/5cd75a7359ef5c8a44d2a5cc60624e399e9bf580))
* add pipeline data ([82a0f0d](https://github.com/amit-ksh/datareel-ai-sdk/commit/82a0f0d7791d6aadcb39a27b96f9f6d7f1969f64))
* add presentation_content dynamic field for generate video ([2af9caf](https://github.com/amit-ksh/datareel-ai-sdk/commit/2af9cafe8a6dfc7d01756599f4d084c663d0ab91))
* add scripts in the video recorder ([c85e19c](https://github.com/amit-ksh/datareel-ai-sdk/commit/c85e19ccb089baba414e76243dcdbe295b4d7fbd))
* add support for dynamic presentation_content in  generate video ([d78794e](https://github.com/amit-ksh/datareel-ai-sdk/commit/d78794e2bc549cfddbedb6cbd1fd2a7ae2e5029e))
* add thumbnail ([3362d7d](https://github.com/amit-ksh/datareel-ai-sdk/commit/3362d7d76c57b1156e1da91ed7b7bd5d224574dd))
* add video preview for pipeline ([93935e6](https://github.com/amit-ksh/datareel-ai-sdk/commit/93935e6df27dc93fb8202bf01513a2b6e4d0a85e))
* api version connection ([2c3649a](https://github.com/amit-ksh/datareel-ai-sdk/commit/2c3649a2108597fe6aa3de8e218ff7959b19ba32))
* avatar name input in persona create form ([9e6186d](https://github.com/amit-ksh/datareel-ai-sdk/commit/9e6186de692a4f048bb60fe49e41927fd5fe4680))
* enhance presentation_content structure in DataReel class ([0171737](https://github.com/amit-ksh/datareel-ai-sdk/commit/01717374d9811fd4f07d66fe3cf201d1f7fd41f1))
* lock user label if user not logged in ([45e424b](https://github.com/amit-ksh/datareel-ai-sdk/commit/45e424bb69484073471bc73fda1d23a69a14bb8c))
* package api version connection ([e4b7ad2](https://github.com/amit-ksh/datareel-ai-sdk/commit/e4b7ad23e4cb73e8eab8beedd5cba96d87244ce1))
* prod sdk setup ([0981cae](https://github.com/amit-ksh/datareel-ai-sdk/commit/0981caea1425d512d5034038979dee51e018052a))
* rename createAvatar to createVideoAvatar and update related logic for video file handling ([d0016af](https://github.com/amit-ksh/datareel-ai-sdk/commit/d0016afa7c06203774d1da884251ffa38d9b35f6))
* shift package to prod ([3210cb9](https://github.com/amit-ksh/datareel-ai-sdk/commit/3210cb918ea2607616f7d8988f93c715e48cdb55))
* update Datareel SDK integration with new API key and organization ID handling ([c2b0274](https://github.com/amit-ksh/datareel-ai-sdk/commit/c2b027441aa5a819dfda6e2882f4d497ec80b099))
* update datareel video player ui ([9c516dd](https://github.com/amit-ksh/datareel-ai-sdk/commit/9c516dd5ee14051e009ad7e2b9cca09936af94fc))
* update persona creation to use empty reference_id and rename deletePersonaAssets method ([8155f8f](https://github.com/amit-ksh/datareel-ai-sdk/commit/8155f8ff0c1a147870a3a566fb55e825f72dbd8a))
* updated asset access logic ([c87d9b9](https://github.com/amit-ksh/datareel-ai-sdk/commit/c87d9b935fadb66b20114504854be92c73bc1955))
* user label UI improvement ([1d1a942](https://github.com/amit-ksh/datareel-ai-sdk/commit/1d1a942a3c71e690467f4cb24340f66e35ae10b4))


### Bug Fixes

* create avatar flow ([433a909](https://github.com/amit-ksh/datareel-ai-sdk/commit/433a9090526b51d25fcc219b9efe54929fec6d22))
* default apikey logic ([cbd1a9a](https://github.com/amit-ksh/datareel-ai-sdk/commit/cbd1a9a7ecca0c7dd9f5b9a9eaa927ed3ae27afb))
* improve user label selection UI and add no labels message ([42d28ff](https://github.com/amit-ksh/datareel-ai-sdk/commit/42d28ffb158004295afdd2a07d8eba0d7438d1c2))
* update button styling and login prompt in VideoCreateForm ([8d2f3ec](https://github.com/amit-ksh/datareel-ai-sdk/commit/8d2f3ec8c229fb0c47021ea676d86af6a781cfe9))
* update LanguageCardProps to allow ReactNode for flag and modify getLanguages to prioritize English language ([7a364bb](https://github.com/amit-ksh/datareel-ai-sdk/commit/7a364bbe1b01f0760814241e0f7dcc0b1bc075bd))
* update paths for SDK files in package.json ([ff03f2a](https://github.com/amit-ksh/datareel-ai-sdk/commit/ff03f2a4b61538b06f58fe6539460f800d1baeb0))
* update query key from "avatars" to "personas" in avatar creation logic ([5a9fb94](https://github.com/amit-ksh/datareel-ai-sdk/commit/5a9fb94811ed5f6e604a87aba320b5be358bd6e6))
* update video sharing URLs to use the development environment and improve user label selection logic ([37e6dd6](https://github.com/amit-ksh/datareel-ai-sdk/commit/37e6dd649a0dcbe4d0f2e87de47a282881e7f673))

## 1.0.0 (2025-08-13)


### Features

* add Auth0 login integration ([e8b6016](https://github.com/amit-ksh/datareel-ai-sdk/commit/e8b6016c5c386e0dd67183cffd14f404f821b063))
* add AuthForm and logic connection ([565b017](https://github.com/amit-ksh/datareel-ai-sdk/commit/565b017eb0b41eaa42f7a19276c0d9be29f97cb5))
* add avatar api sdk connection ([73cf476](https://github.com/amit-ksh/datareel-ai-sdk/commit/73cf4769a1aa154b75202e0d81b11e5e9c954ca6))
* add contact form component and integrate sharing options for email and WhatsApp in video creation ([4f40399](https://github.com/amit-ksh/datareel-ai-sdk/commit/4f40399d5a1634686cd231545b7a2adeaca80e74))
* add CreateAvatarForm component and integrate video cropping functionality ([e555091](https://github.com/amit-ksh/datareel-ai-sdk/commit/e5550910bc958f9133bca6daa1da466964b441f1))
* add fetchPipelineFormData function and update video creation logic to use pipeline data ([f354c1d](https://github.com/amit-ksh/datareel-ai-sdk/commit/f354c1d2d339f9a0b78edd4ba8c254b550f02932))
* add FynanciallySharePanel to DatareelVideoPlayer and update share functionality; refactor persona thumbnail reference in VideoCreateForm and API types ([e97af76](https://github.com/amit-ksh/datareel-ai-sdk/commit/e97af769544d009c59972455684db2e6d5d39a1f))
* add getOrganisationLanguages API method and integrate into DataReel class ([ad3fce0](https://github.com/amit-ksh/datareel-ai-sdk/commit/ad3fce0ea6db3e03626f6471d913b4dcbdd179db))
* Add Header and Popover components with stories ([bdabc4f](https://github.com/amit-ksh/datareel-ai-sdk/commit/bdabc4fc0b7929a3948e71f47140a2a1b3de22ab))
* Add ImageCard, LanguageCard, ItemSelector, and ScriptInput components with stories ([a784e2c](https://github.com/amit-ksh/datareel-ai-sdk/commit/a784e2ce2076643ce54ffcbca5d94630078b7684))
* add Login and Input components ([f28a364](https://github.com/amit-ksh/datareel-ai-sdk/commit/f28a3648d622e9f536db74a503e365c67bf2cb18))
* add onboarded parameter to getPersonas and update related components ([773c0d1](https://github.com/amit-ksh/datareel-ai-sdk/commit/773c0d14c45529f61c02d8e710c04e7614181fb8))
* add pagination support for avatars, voices, and pipelines in video creation ([84984e1](https://github.com/amit-ksh/datareel-ai-sdk/commit/84984e1a7df3fe24353db490c66f7f8471967410))
* add share UI lock ([46df3f8](https://github.com/amit-ksh/datareel-ai-sdk/commit/46df3f80b75e40147481bffccf7d91172bc0728d))
* add SharePanel component and integrate with DatareelVideoPlayer ([01a9f71](https://github.com/amit-ksh/datareel-ai-sdk/commit/01a9f719e25545686166c87b19f0457dd3cbdddb))
* add video player ([2caf177](https://github.com/amit-ksh/datareel-ai-sdk/commit/2caf177cf297e2b67c139573086ecf5d92ccb280))
* add VideoRecorder component with recording capabilities ([3d20d43](https://github.com/amit-ksh/datareel-ai-sdk/commit/3d20d432f2add7a94042d26329b732b055053783))
* auth api connection in sdk ([3ad5b00](https://github.com/amit-ksh/datareel-ai-sdk/commit/3ad5b00705ef647af74182a31730ec7411f6beab))
* base sdk setup ([04eff74](https://github.com/amit-ksh/datareel-ai-sdk/commit/04eff74c6c8ce836b8de597af4298dd4baa5f819))
* content-video connection ([b0ae9a5](https://github.com/amit-ksh/datareel-ai-sdk/commit/b0ae9a592db9f7bd986abc4dbac1122faf85b138))
* create avatar connection in the ([6e4c870](https://github.com/amit-ksh/datareel-ai-sdk/commit/6e4c87033ab26771e984b90286139440bb6c87a6))
* create persona api connection ([19f4ce8](https://github.com/amit-ksh/datareel-ai-sdk/commit/19f4ce84fd518807140c083c4c552f4902610e17))
* default setup ([84db25d](https://github.com/amit-ksh/datareel-ai-sdk/commit/84db25d00dd72fd77cf0c8a0eb2b11e6280bdf22))
* dynamic script connection ([9df49e3](https://github.com/amit-ksh/datareel-ai-sdk/commit/9df49e3d0da9e747293a2f8f777f99d815d88de8))
* enhance LanguageCard to display language name using ISO codes with fallback ([3b8ac71](https://github.com/amit-ksh/datareel-ai-sdk/commit/3b8ac7106db3743068d687a85acae0e13edcf6f3))
* enhance layout of ItemSelector component by removing max-width constraint ([3e73e39](https://github.com/amit-ksh/datareel-ai-sdk/commit/3e73e39680b9d8c8dba09bfd82e845dd3173f520))
* enhance VideoCreateForm and SharePanel components; update video creation logic and styling ([e962c44](https://github.com/amit-ksh/datareel-ai-sdk/commit/e962c44949897ea78c4db39697846e85dcdde533))
* improve the video-create-form ([316adc0](https://github.com/amit-ksh/datareel-ai-sdk/commit/316adc063526f07b96b2f91a89b4a7cae1988d3e))
* Introduce Datareel context for managing SDK instances and organization configuration ([ff50a09](https://github.com/amit-ksh/datareel-ai-sdk/commit/ff50a0916e489c9caa2a347164b3d9ed46d4ad42))
* Refactor asset API methods and enhance type definitions for better clarity and functionality ([71985a7](https://github.com/amit-ksh/datareel-ai-sdk/commit/71985a78c4d1fde2f500cfd1db4c4a15c84ba30a))
* rename video player component ([cf47aa5](https://github.com/amit-ksh/datareel-ai-sdk/commit/cf47aa589eb42baa203f732b4631790894d66a2a))
* update AuthForm to include detailed success and error handling with user data ([8aca068](https://github.com/amit-ksh/datareel-ai-sdk/commit/8aca0685aa16c042c75a653d6ca0c20f0ed59dbd))
* Update component styles and story titles for consistency ([9c3fc18](https://github.com/amit-ksh/datareel-ai-sdk/commit/9c3fc1823eecf8b56bc950f789002cb603ac5a89))
* update package name to scoped version ([086950b](https://github.com/amit-ksh/datareel-ai-sdk/commit/086950b5b3ff8cc168452284c296ad5d10e9eae9))
* update README.md to enhance documentation and provide detailed usage examples ([b1485db](https://github.com/amit-ksh/datareel-ai-sdk/commit/b1485db0a6b180c5738ec90921447fdaecf1b903))
* update sub-header UI ([e6458e5](https://github.com/amit-ksh/datareel-ai-sdk/commit/e6458e5282051abf260886e23de3efac2916a459))
* update VideoCreateForm to handle video generation data and remove unused Language interface ([0fec283](https://github.com/amit-ksh/datareel-ai-sdk/commit/0fec2832928e58c3432fb609db90688ab797dcbe))
* update VideoView to use secure WebSocket URL and improve share link UI ([25949f5](https://github.com/amit-ksh/datareel-ai-sdk/commit/25949f5e610a2b31acba7386531c99710ee2e4ca))
* user label and language connection ([74f8781](https://github.com/amit-ksh/datareel-ai-sdk/commit/74f8781b7a2f18ec30fde774700da6e9fbf96f06))
* video create part 1 ([68d1c5f](https://github.com/amit-ksh/datareel-ai-sdk/commit/68d1c5f21ecbdb09a46d64d194d7c943d843e70a))
* video view ([000c277](https://github.com/amit-ksh/datareel-ai-sdk/commit/000c2778c2dc4b1bdbcceae64b35a1a46a349ce2))
* wrap DatareelContext.Provider with QueryClientProvider for React Query integration ([0bdc404](https://github.com/amit-ksh/datareel-ai-sdk/commit/0bdc404a372bc7d80041d47d3e562182cf890e1a))


### Bug Fixes

* action ([a68302e](https://github.com/amit-ksh/datareel-ai-sdk/commit/a68302eb296e3a6000646eaeb47f39944f3632b7))
* handle potential undefined response in onVideoGenerate call in VideoCreateForm ([f756aa0](https://github.com/amit-ksh/datareel-ai-sdk/commit/f756aa0dcc0c8c88ab1ff77d218c0fd736a8c58e))
* remove unnecessary console logs and improve audio handling in useVideoPlayer ([520ad85](https://github.com/amit-ksh/datareel-ai-sdk/commit/520ad85ace6cff4c48e4620d02d9d5bbce03f845))
* set video approval to true for all video types in DataReel class ([b69515b](https://github.com/amit-ksh/datareel-ai-sdk/commit/b69515bed040fef67dd021de3c518b5de289f859))

## Changelog
