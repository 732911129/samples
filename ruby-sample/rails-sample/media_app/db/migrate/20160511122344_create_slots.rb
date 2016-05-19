class CreateSlots < ActiveRecord::Migration
  def change
    create_table :slots do |t|
      t.string :name
      t.text :value

      t.timestamps null: false
    end
    add_index :slots, :name, unique: true
  end
end
