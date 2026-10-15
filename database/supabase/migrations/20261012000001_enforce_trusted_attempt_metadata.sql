-- Close the nullable-metadata gap in trusted assessment results without
-- rewriting legacy attempts or changing the trusted assessment RPCs.

alter table public.assessment_attempts
  drop constraint if exists assessment_attempts_server_result_check;

alter table public.assessment_attempts
  add constraint assessment_attempts_server_result_check check (
    grading_method = 'legacy_untrusted'
    or (
      grading_method = 'server_quiz'
      and session_id is not null
      and correct_count is not null
      and total_questions is not null
      and pass_threshold is not null
      and correct_count between 0 and total_questions
      and total_questions between 1 and 50
      and score = round((correct_count::numeric * 100) / nullif(total_questions, 0), 2)
      and pass_threshold between 1 and 100
      and passed = (score >= pass_threshold)
    )
  );
