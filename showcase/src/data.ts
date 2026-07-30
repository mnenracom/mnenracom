export type ProductId = "foto" | "biz" | "kroy";

export interface ReleaseFallback {
  tag: string;
  publishedAt: string;
  url: string;
}

export interface Product {
  id: ProductId;
  index: string;
  name: string;
  label: string;
  description: string;
  status: string;
  image: string;
  imageAlt: string;
  repository: string;
  repositoryName: string;
  features: readonly [string, string, string];
  release: ReleaseFallback;
}

export interface PipelineStage {
  id: string;
  index: string;
  title: string;
  short: string;
  description: string;
}

export const products: readonly Product[] = [
  {
    id: "foto",
    index: "01",
    name: "МНЕНРАФОТО",
    label: "Фотопечать",
    description:
      "Локальная Windows-программа для быстрой подготовки, обработки и печати фотографий.",
    status: "0.2.0 Alpha 2 · публичное тестирование",
    image: "assets/mnenrafoto.webp",
    imageAlt: "Интерфейс фотопечати МНЕНРАФОТО 0.2 Alpha 2",
    repository: "https://github.com/mnenracom/mnenrafoto-releases",
    repositoryName: "mnenrafoto-releases",
    features: [
      "Пакетная обработка, пресеты и печатные раскладки.",
      "Отдельный режим для фото на документы.",
      "Локальная работа без загрузки изображений в облако.",
    ],
    release: {
      tag: "v0.2.0-alpha.2",
      publishedAt: "2026-07-17",
      url: "https://github.com/mnenracom/mnenrafoto-releases/releases/tag/v0.2.0-alpha.2",
    },
  },
  {
    id: "biz",
    index: "02",
    name: "МНЕНРАБИЗНЕС",
    label: "Финансы Ozon",
    description:
      "Локальная Windows-программа для анализа финансовых отчётов Ozon из Excel.",
    status: "0.2.0 Alpha 2 · публичное тестирование",
    image: "assets/mnenrabiz.webp",
    imageAlt: "Финансовая панель МНЕНРАБИЗНЕС 0.2 Alpha 2",
    repository: "https://github.com/mnenracom/mnenrabiz-releases",
    repositoryName: "mnenrabiz-releases",
    features: [
      "Реализация, начисления, себестоимость и банковская выписка.",
      "Финансовая панель, динамика, товары и возвраты.",
      "Локальное хранение периодов и экспорт итогов в Excel.",
    ],
    release: {
      tag: "v0.2.0-alpha.1",
      publishedAt: "2026-07-12",
      url: "https://github.com/mnenracom/mnenrabiz-releases/releases/tag/v0.2.0-alpha.1",
    },
  },
  {
    id: "kroy",
    index: "03",
    name: "МНЕНРАКРОЙ",
    label: "Мебельные фасады",
    description:
      "Локальная Windows-программа для оформления заказов на мебельные фасады, расчёта MDF/HPL, клиентских PDF и HPL-раскроя.",
    status: "0.1.0 Alpha 1 · закрытое/публичное тестирование",
    image: "assets/mnenrakroy.webp",
    imageAlt: "Оформление заказа и расчёт мебельных фасадов в МНЕНРАКРОЙ 0.1 Alpha 1",
    repository: "https://github.com/mnenracom/mnenrakroy-releases",
    repositoryName: "mnenrakroy-releases",
    features: [
      "Заказы, клиенты, материалы, кромки и расчёт деталей.",
      "Полосовой HPL-раскрой для листовых материалов.",
      "Клиентские PDF, карты раскроя и резервные копии.",
    ],
    release: {
      tag: "v0.1.0-alpha.1",
      publishedAt: "2026-07-29",
      url: "https://github.com/mnenracom/mnenrakroy-releases/releases/tag/v0.1.0-alpha.1",
    },
  },
] as const;

export const pipeline: readonly PipelineStage[] = [
  {
    id: "task",
    index: "01",
    title: "Задача",
    short: "Понять реальный сценарий",
    description:
      "Начать не с функции, а с того, что человек должен сделать, где он теряет время и какие ограничения нельзя игнорировать.",
  },
  {
    id: "design",
    index: "02",
    title: "Проектирование",
    short: "Выстроить интерфейс и модель",
    description:
      "Собрать понятный пользовательский путь, структуру данных и визуальную систему до того, как сложность попадёт в код.",
  },
  {
    id: "build",
    index: "03",
    title: "Разработка",
    short: "Реализовать рабочую систему",
    description:
      "Превратить сценарий в целостный продукт: от основных операций и состояний до аккуратных деталей интерфейса.",
  },
  {
    id: "verify",
    index: "04",
    title: "Проверка",
    short: "Испытать на настоящих задачах",
    description:
      "Проверить продукт на реальных данных и устройствах, уточнить формулировки, ошибки и крайние сценарии.",
  },
  {
    id: "release",
    index: "05",
    title: "Релиз",
    short: "Собрать, описать и выпустить",
    description:
      "Подготовить сборку, документацию, контрольные суммы и публичную страницу, чтобы продуктом можно было пользоваться.",
  },
] as const;
