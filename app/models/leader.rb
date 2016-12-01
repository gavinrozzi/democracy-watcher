# Author::    Benjamin Piouffle
# License::   MIT

class Leader < ActiveRecord::Base
  has_many :statements, class_name: Statement

  validates :name, presence: true

  mount_uploader :picture, LeaderPictureUploader

  def self.with_statements_count
    left_joins(:statements)
        .group('leaders.id')
        .select('leaders.*, COUNT(statement) AS statements_count')
  end

  def self.ordered_by_statements_count_desc
    left_joins(:statements)
        .group('leaders.id')
        .select('leaders.*')
        .order('COUNT(statement) DESC')
  end
end
