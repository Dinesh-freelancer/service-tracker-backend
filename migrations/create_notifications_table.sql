CREATE TABLE IF NOT EXISTS notifications (
  NotificationId INT NOT NULL AUTO_INCREMENT,
  UserId INT NOT NULL,
  Type ENUM('JobUpdate', 'LowStock', 'Payment', 'System', 'JobAssignment') NOT NULL,
  Title VARCHAR(255) NOT NULL,
  Message TEXT,
  ReferenceId VARCHAR(50),
  IsRead TINYINT(1) DEFAULT 0,
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (NotificationId),
  FOREIGN KEY (UserId) REFERENCES users(UserId) ON DELETE CASCADE,
  INDEX idx_user (UserId),
  INDEX idx_isread (IsRead)
);
