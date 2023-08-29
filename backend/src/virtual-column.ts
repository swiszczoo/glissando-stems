import 'reflect-metadata';

export const VIRTUAL_COLUMN_KEY = Symbol('VIRTUAL_COLUMN_KEY');
export const VIRTUAL_COLUMN_TYPE = Symbol('VIRTUAL_COLUMN_TYPE');

export function VirtualColumn(
  type?: 'string' | 'int',
  name?: string,
): PropertyDecorator {
  return (target, propertyKey) => {
    const metaInfo = Reflect.getMetadata(VIRTUAL_COLUMN_KEY, target) || {};
    const typeInfo = Reflect.getMetadata(VIRTUAL_COLUMN_TYPE, target) || {};

    metaInfo[propertyKey] = name ?? propertyKey;
    typeInfo[propertyKey] = type ?? 'string';

    Reflect.defineMetadata(VIRTUAL_COLUMN_KEY, metaInfo, target);
    Reflect.defineMetadata(VIRTUAL_COLUMN_TYPE, typeInfo, target);
  };
}
