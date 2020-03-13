declare interface IExampleWebPartStrings {
  PropertyPaneDescription: string;
  BasicGroupName: string;
  DescriptionFieldLabel: string;
}

declare module 'ExampleWebPartStrings' {
  const strings: IExampleWebPartStrings;
  export = strings;
}
