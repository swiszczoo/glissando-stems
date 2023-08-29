import { VIRTUAL_COLUMN_KEY, VIRTUAL_COLUMN_TYPE } from './virtual-column';
import { SelectQueryBuilder } from 'typeorm';

declare module 'typeorm' {
  interface SelectQueryBuilder<Entity> {
    getMany(this: SelectQueryBuilder<Entity>): Promise<Entity[] | undefined>;
    getOne(this: SelectQueryBuilder<Entity>): Promise<Entity | undefined>;
  }
}

SelectQueryBuilder.prototype.getMany = async function () {
  const { entities, raw } = await this.getRawAndEntities();

  const items = entities.map((entity, index) => {
    const metaInfo = Reflect.getMetadata(VIRTUAL_COLUMN_KEY, entity) ?? {};
    const typeInfo = Reflect.getMetadata(VIRTUAL_COLUMN_TYPE, entity) ?? {};
    const item = raw[index];

    for (const [propertyKey, name] of Object.entries<string>(metaInfo)) {
      const isInt = typeInfo[propertyKey] === 'int';
      if (isInt) {
        entity[propertyKey] = parseInt(item[name]);
      } else {
        entity[propertyKey] = item[name];
      }
    }

    return entity;
  });

  return [...items];
};

SelectQueryBuilder.prototype.getOne = async function () {
  const { entities, raw } = await this.getRawAndEntities();
  const metaInfo = Reflect.getMetadata(VIRTUAL_COLUMN_KEY, entities[0]) ?? {};
  const typeInfo = Reflect.getMetadata(VIRTUAL_COLUMN_TYPE, entities[0]) ?? {};

  for (const [propertyKey, name] of Object.entries<string>(metaInfo)) {
    const isInt = typeInfo[propertyKey] === 'int';
    if (isInt) {
      entities[0][propertyKey] = parseInt(raw[0][name]);
    } else {
      entities[0][propertyKey] = raw[0][name];
    }
  }

  return entities[0];
};
