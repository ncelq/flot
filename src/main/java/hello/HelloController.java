package hello;

import java.util.ArrayList;
import java.util.List;

import javax.servlet.http.HttpServletResponse;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.google.gson.Gson;

@RestController
public class HelloController {
	
	public List<Data> list = new ArrayList<Data>();
    
    @RequestMapping(value="/api", method = RequestMethod.GET)
    public String index(HttpServletResponse response) {
    	response.setContentType("application/json");
    	Gson gson = new Gson();
        return gson.toJson(list);
    }
    
}
