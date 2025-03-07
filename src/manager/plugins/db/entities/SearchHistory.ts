import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn
} from 'typeorm'

@Entity('search_history')
export class SearchHistory {
  // @ts-ignore
  @PrimaryGeneratedColumn()
  id!: number
  // @ts-ignore
  @Column({ type: 'varchar' })
  text!: string
  // @ts-ignore
  @CreateDateColumn()
    // @ts-ignore
  searchTime: Date

  static create(text: string) {
    const history = new SearchHistory()
    history.text = text
    return history
  }
}
