import { Entity, Column, PrimaryColumn, CreateDateColumn } from "typeorm";

@Entity('recent_search')
export class RecentSearch {
    // @ts-ignore
  @PrimaryColumn({ type: "varchar" })
  puuid: string;
  // @ts-ignore
  @Column({ type: "varchar" })
  summonerName: string;
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
  searchTime: Date;

  static create(
    puuid: string,
    summonerName: string,
    avatar?: string,
    region?: string,
    regionDetail?: string,
  ): RecentSearch {
    const recentSearch = new RecentSearch();
    recentSearch.puuid = puuid;
    recentSearch.summonerName = summonerName;
    recentSearch.avatar = avatar;
    recentSearch.region = region;
    recentSearch.regionDetail = regionDetail;
    return recentSearch;
  }
}
