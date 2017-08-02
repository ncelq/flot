package hello;

import java.util.Random;
import java.util.concurrent.Executors;
import java.util.concurrent.ThreadPoolExecutor;

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;

@SpringBootApplication
public class Application implements CommandLineRunner {
	@Autowired
	JdbcTemplate jdbcTemplate;
	
	@Autowired
	HelloController controller;
	

    @Override
    public void run(String... strings) throws Exception {

        final int threadNum = 1;
        final int sleepTime = 500;
        final int listSize = 100;
        
        Runnable r = () -> {
			try {
        		while(true) {
        			int n = new Random().nextInt(listSize);
        			int[] list = new int[n];
        			int sum = 0;
        			
        			for (int j = 0; j < list.length; j++) {
        				list[j] = j + n;
        			}
        			for (int i = 0; i < list.length - 1; i++) {
        				list[i] = i * n;
        				sum = list[i] * list[i + 1];
        			}
        			
    				System.out.println("Thread="+Thread.currentThread().getName()+", size=" + n + ", random sum=" + sum);
    				Data data = new Data();
    				data.setSize(Integer.toString(n));
    				data.setSum(Integer.toString(sum));
    				data.setThreadName(Thread.currentThread().getName());
    				controller.list.add(data);

        			/*
        			String sql = "INSERT INTO data (name, size, sum) VALUES ('"+Thread.currentThread().getName()+"','"+n+"','"+sum+"')";
        			jdbcTemplate.update(sql);
        			*/

    				
    				Thread.sleep(n * sleepTime);

        		}
			} catch (InterruptedException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
        };
        
        final ThreadPoolExecutor executor = (ThreadPoolExecutor) Executors.newFixedThreadPool(threadNum);
        
        for (int i = 0; i < threadNum; i++) {
        	executor.submit(r);
        }
    }
	
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
        
    }
    
	   @Bean
	    public DataSource dataSource() {
	        DriverManagerDataSource dataSource = new DriverManagerDataSource();
	        //MySQL database we are using
	        dataSource.setDriverClassName("org.postgresql.Driver");
	        dataSource.setUrl("jdbc:postgresql://test.c6ipkvbnh9ff.us-east-1.rds.amazonaws.com:5432/test");//change url
	        dataSource.setUsername("angusscli");//change userid
	        dataSource.setPassword("admin12345678");//change pwd
	        return dataSource;
	    }
	 
	    @Bean
	    public JdbcTemplate jdbcTemplate() {
	        JdbcTemplate jdbcTemplate = new JdbcTemplate();
	        jdbcTemplate.setDataSource(dataSource());
	        return jdbcTemplate;
	    }

}
