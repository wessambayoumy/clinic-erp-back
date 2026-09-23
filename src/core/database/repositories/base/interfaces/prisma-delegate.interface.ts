/**
 * Structural subset of a generated Prisma model delegate
 * (e.g. `tx.patient`, `tx.appointment`) that `BaseRepository` depends on.
 *
 * Concrete repositories point their generic parameters at the real
 * Prisma-generated types (`Prisma.PatientWhereInput`, `Prisma.PatientCreateInput`,
 * etc.) — this interface only pins down the method shapes, not the payloads.
 */
export interface IPrismaDelegate<
  TModel,
  TWhereUniqueInput,
  TWhereInput,
  TCreateInput,
  TUpdateInput,
> {
  findUnique(args: { where: TWhereUniqueInput }): Promise<TModel | null>;

  findMany(args: {
    where?: TWhereInput;
    skip?: number;
    take?: number;
  }): Promise<TModel[]>;

  count(args: { where?: TWhereInput }): Promise<number>;

  create(args: { data: TCreateInput }): Promise<TModel>;

  update(args: { where: TWhereUniqueInput; data: TUpdateInput }): Promise<TModel>;

  delete(args: { where: TWhereUniqueInput }): Promise<TModel>;
}
