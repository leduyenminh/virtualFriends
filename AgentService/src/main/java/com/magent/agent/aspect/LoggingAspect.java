package com.magent.agent.aspect;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class LoggingAspect {

    private static final Logger logger = LoggerFactory.getLogger(LoggingAspect.class);

    @Around("execution(* com.magent.agent..*(..)) && !execution(* com.magent.agent.aspect..*(..))")
    public Object logMethodExecution(ProceedingJoinPoint joinPoint) throws Throwable {
        String methodName = joinPoint.getSignature().getName();
        String className = joinPoint.getSignature().getDeclaringTypeName();
        logger.info("Entering method: {}.{} with arguments: {}", className, methodName, joinPoint.getArgs());
        long startTime = System.currentTimeMillis();
        try {
            Object result = joinPoint.proceed();
            long endTime = System.currentTimeMillis();
            logger.info("Exiting method: {}.{} in {} ms", className, methodName, (endTime - startTime));
            return result;
        } catch (Exception e) {
            logger.error("Exception in method: {}.{} - {}", className, methodName, e.getMessage(), e);
            throw e;
        }
    }
}