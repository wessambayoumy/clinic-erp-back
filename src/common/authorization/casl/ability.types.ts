export interface AppAbility {
	can(action: string, subject: string): boolean;
	cannot(action: string, subject: string): boolean;
}
