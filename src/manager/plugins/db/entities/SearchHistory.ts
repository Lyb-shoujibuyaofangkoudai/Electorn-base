import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from "typeorm";

@Entity("search_history")
export class SearchHistory {
  // @ts-ignore
  @PrimaryGeneratedColumn()
  id!: number;
  // @ts-ignore
  @Column({ type: "varchar" })
  summonerName!: string;
  // @ts-ignore
  @Column({ type: "varchar", nullable: true })
  avatar?: string;
  // @ts-ignore
  @Column({ type: "varchar", nullable: true })
  region?: string;
  // @ts-ignore
  @Column({ type: "varchar", nullable: true })
  regionDetail?: string;
  // @ts-ignore
  @CreateDateColumn()
  searchTime!: Date;

  static create(summonerName: string, avatar?: string, region?: string, regionDetail?: string) {
    const history = new SearchHistory();
    history.summonerName = summonerName;
    history.avatar = avatar;
    history.region = region;
    return history;
  }
}
