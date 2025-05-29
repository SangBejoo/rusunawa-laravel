-- Function to determine if a student is eligible for booking based on qualification
DROP FUNCTION IF EXISTS is_student_eligible_for_booking;
DELIMITER $$
CREATE FUNCTION is_student_eligible_for_booking(p_tenant_id INT) 
RETURNS BOOLEAN
DETERMINISTIC
BEGIN
    DECLARE v_qualified BOOLEAN;
    DECLARE v_rank INT;
    DECLARE v_qualification_exists BOOLEAN;
    DECLARE v_eligibility_threshold INT DEFAULT 10; -- Default threshold: top 10 are eligible
    
    -- Check if tenant has qualification data
    SELECT EXISTS(
        SELECT 1 FROM student_qualifications 
        WHERE tenant_id = p_tenant_id
    ) INTO v_qualification_exists;
    
    -- If no qualification exists yet, allow booking (can be changed to be more strict)
    IF NOT v_qualification_exists THEN
        RETURN TRUE;
    END IF;
    
    -- Check qualification status
    SELECT qualified, rank INTO v_qualified, v_rank
    FROM student_qualifications
    WHERE tenant_id = p_tenant_id;
    
    -- If explicitly qualified, allow booking
    IF v_qualified IS TRUE THEN
        RETURN TRUE;
    END IF;
    
    -- Otherwise check rank against threshold
    IF v_rank IS NOT NULL AND v_rank <= v_eligibility_threshold THEN
        RETURN TRUE;
    END IF;
    
    -- Default: not eligible
    RETURN FALSE;
END$$
DELIMITER ;
