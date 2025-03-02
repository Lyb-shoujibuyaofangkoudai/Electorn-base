import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from "typeorm";

@Entity("search_history")
export class SearchHistory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar" })
  summonerName!: string;

  @Column({ type: "varchar", nullable: true })
  avatar?: string;

  @CreateDateColumn()
  searchTime!: Date;

  static create(summonerName: string, avatar?: string) {
    const history = new SearchHistory();
    history.summonerName = summonerName;
    history.avatar = avatar;
    return history;
  }
}
