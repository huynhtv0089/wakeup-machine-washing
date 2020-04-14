#------------------------------------------------------------------------------------------------------------------------------------------------------
CREATE TABLE `employee` (
  `id` varchar(150) NOT NULL,
  `username` varchar(100) DEFAULT NULL,
  `password` varchar(100) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `birthday` varchar(20) DEFAULT NULL,
  `phone` varchar(11) DEFAULT NULL,
  `address` varchar(150) DEFAULT NULL,
  `role` varchar(50) DEFAULT NULL,
  `created_date_time` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

#------------------------------------------------------------------------------------------------------------------------------------------------------
CREATE TABLE `history` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `content` text,
  `created_date_time` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

#------------------------------------------------------------------------------------------------------------------------------------------------------
CREATE TABLE `order` (
  `id` varchar(150) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `birthday` varchar(20) DEFAULT NULL,
  `phone` varchar(11) DEFAULT NULL,
  `address` varchar(200) DEFAULT NULL,
  `wash` float DEFAULT NULL,
  `drying` float DEFAULT NULL,
  `wash_special` int(11) DEFAULT NULL,
  `wash_blanket` int(11) DEFAULT NULL,
  `add_fabric_softener` int(11) DEFAULT NULL,
  `small_bear` int(11) DEFAULT NULL,
  `big_bear` int(11) DEFAULT NULL,
  `machine` int(11) DEFAULT NULL,
  `total_money` float DEFAULT NULL,
  `sale_of` int(11) DEFAULT NULL,
  `description_sale_of` text,
  `setting_order_id` varchar(150) DEFAULT NULL,
  `created_date_time` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

#------------------------------------------------------------------------------------------------------------------------------------------------------
CREATE TABLE `setting` (
  `id` varchar(20) NOT NULL,
  `total_machine_washing` int(11) DEFAULT NULL,
  `price_wash_1_to_3` int(11) DEFAULT NULL,
  `price_wash_3_to_5` int(11) DEFAULT NULL,
  `price_wash_5_to_7` int(11) DEFAULT NULL,
  `price_drying_1_to_3` int(11) DEFAULT NULL,
  `price_drying_3_to_5` int(11) DEFAULT NULL,
  `price_drying_5_to_7` int(11) DEFAULT NULL,
  `price_wash_drying_more_than_7` int(11) DEFAULT NULL,
  `price_wash_special` int(11) DEFAULT NULL,
  `price_wash_blanket` int(11) DEFAULT NULL,
  `price_add_fbric_softener` int(11) DEFAULT NULL,
  `price_small_bear` int(11) DEFAULT NULL,
  `price_big_bear` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

#------------------------------------------------------------------------------------------------------------------------------------------------------
CREATE TABLE `setting_order` (
  `id` varchar(150) NOT NULL,
  `total_machine_washing` int(11) DEFAULT NULL,
  `price_wash_1_to_3` int(11) DEFAULT NULL,
  `price_wash_3_to_5` int(11) DEFAULT NULL,
  `price_wash_5_to_7` int(11) DEFAULT NULL,
  `price_drying_1_to_3` int(11) DEFAULT NULL,
  `price_drying_3_to_5` int(11) DEFAULT NULL,
  `price_drying_5_to_7` int(11) DEFAULT NULL,
  `price_wash_drying_more_than_7` int(11) DEFAULT NULL,
  `price_wash_special` int(11) DEFAULT NULL,
  `price_wash_blanket` int(11) DEFAULT NULL,
  `price_add_fbric_softener` int(11) DEFAULT NULL,
  `price_small_bear` int(11) DEFAULT NULL,
  `price_big_bear` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

#------------------------------------------------------------------------------------------------------------------------------------------------------

CREATE DEFINER=`root`@`localhost` PROCEDURE `proc_get_list_statictis_money`(
	IN list_month_year TEXT,
    IN size INT(11)
)
BEGIN
	SET @query_statement = '';
	SET @i = size;
    WHILE (@i > 0) DO
		SET @monthYear = SUBSTRING_INDEX(SUBSTRING_INDEX(list_month_year, ",", @i), ",", -1);
        IF @i > 1 THEN
			SET @query_statement = CONCAT(@query_statement, 'SELECT IFNULL(SUM(total_money), 0) AS total_money, \'', @monthYear ,'\' AS month_year FROM laundry.order WHERE created_date_time LIKE \'%', @monthYear, '%\'', ' UNION ');
        ELSE
			SET @query_statement = CONCAT(@query_statement, 'SELECT IFNULL(SUM(total_money), 0) AS total_money, \'', @monthYear ,'\' AS month_year FROM laundry.order WHERE created_date_time LIKE \'%', @monthYear, '%\'');
        END IF;
		SET @i = @i - 1;
    END WHILE;
    
    PREPARE stmt FROM @query_statement;
	EXECUTE stmt;
END